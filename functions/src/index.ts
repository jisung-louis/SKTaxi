import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import https from 'https';
const Parser = require('rss-parser');
import axios from 'axios';
import * as cheerio from 'cheerio';

// SKTaxi: 모든 함수 기본 리전을 Firestore 리전과 동일하게 설정
setGlobalOptions({ region: 'asia-northeast3' });

// SKTaxi: Firebase Admin SDK 초기화 (안전한 방식)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const fcm = admin.messaging();

// SKTaxi: FCM 서비스 확인
console.log('🔍 FCM 서비스 초기화 확인:', !!fcm);

// SKTaxi: RSS 파서 설정
const parser = new Parser({
  customFields: {
    item: ['description', 'content:encoded']
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  requestOptions: {
    // 🔒 Only the parser's HTTPS requests bypass strict cert checks (do NOT disable globally)
    agent: new https.Agent({ rejectUnauthorized: false }),
  },
});

// SKTaxi: 공지사항 카테고리별 RSS 설정
const NOTICE_CATEGORIES = {
  '새소식': 97,
  '학사': 96,
  '학생': 116,
  '장학/등록/학자금': 95,
  '입학': 94,
  '취업/진로개발/창업': 93,
  '공모/행사': 90,
  '교육/글로벌': 89,
  '일반': 87,
  '입찰구매정보': 86,
  '사회봉사센터': 84,
  '장애학생지원센터': 83,
  '생활관': 82,
  '비교과': 80
} as const;

const RSS_BASE_URL = 'https://www.sungkyul.ac.kr/bbs/skukr';
const BASE_URL = 'https://www.sungkyul.ac.kr';

export const onJoinRequestCreate = onDocumentCreated('joinRequests/{requestId}', async (event) => {
  const snap = event.data;
  if (!snap) return;
  const req = snap.data() as any;
  const leaderId = req?.leaderId as string | undefined;
  if (!leaderId) return;

  const userDoc = await db.doc(`users/${leaderId}`).get();
  const tokens: string[] = (userDoc.get('fcmTokens') || []) as string[];
  if (!tokens.length) return;

  const message = {
    tokens,
    notification: {
      title: '동승 요청이 도착했어요',
      body: '앱에서 확인하고 수락/거절을 선택해주세요.',
    },
    data: {
      type: 'join_request',
      partyId: String(req?.partyId || ''),
      requestId: String(event.params.requestId || ''),
      requesterId: String(req?.requesterId || ''),
    },
    apns: { payload: { aps: { sound: 'default' } } },
    android: { priority: 'high' as const },
  };

  const resp = await fcm.sendEachForMulticast(message as any);
  // SKTaxi: 실패한 토큰 정리
  const failedTokens: string[] = [];
  resp.responses.forEach((r, idx) => {
    if (!r.success) failedTokens.push((message as any).tokens[idx]);
  });
  if (failedTokens.length) {
    await db.runTransaction(async (tx) => {
      const ref = db.doc(`users/${leaderId}`);
      const snapUser = await tx.get(ref);
      const cur: string[] = (snapUser.get('fcmTokens') || []) as string[];
      const next = cur.filter((t) => !failedTokens.includes(t));
      tx.update(ref, { fcmTokens: next });
    });
  }
});

// SKTaxi: 파티 삭제 시 멤버들에게 알림 전송
export const onPartyDelete = onDocumentDeleted('parties/{partyId}', async (event) => {
  const snap = event.data;
  if (!snap) return;
  const partyData = snap.data() as any;
  const members = partyData?.members as string[] | undefined;
  const leaderId = partyData?.leaderId as string | undefined;
  
  if (!members || !Array.isArray(members) || members.length <= 1) return; // 리더만 있으면 알림 불필요

  // SKTaxi: 리더를 제외한 멤버들에게만 알림 전송
  const memberIds = members.filter((memberId: string) => memberId !== leaderId);
  if (memberIds.length === 0) return;

  // SKTaxi: 멤버들의 FCM 토큰 수집
  const tokens: string[] = [];
  for (const memberId of memberIds) {
    try {
      const userDoc = await db.doc(`users/${memberId}`).get();
      const userTokens = (userDoc.get('fcmTokens') || []) as string[];
      tokens.push(...userTokens);
    } catch (error) {
      console.error(`Error getting tokens for user ${memberId}:`, error);
    }
  }

  if (tokens.length === 0) return;

  const message = {
    tokens,
    notification: {
      title: '파티가 해체되었어요',
      body: '리더가 파티를 해체했습니다.',
    },
    data: {
      type: 'party_deleted',
      partyId: String(event.params.partyId || ''),
    },
    apns: { payload: { aps: { sound: 'default' } } },
    android: { priority: 'high' as const },
  };

  const resp2 = await fcm.sendEachForMulticast(message as any);
  // SKTaxi: 실패한 토큰 정리 (멤버 전원)
  const deadTokens: string[] = [];
  resp2.responses.forEach((r, idx) => {
    if (!r.success) deadTokens.push((message as any).tokens[idx]);
  });
  if (deadTokens.length) {
    // 각 멤버 문서에서 죽은 토큰 제거
    await Promise.all(memberIds.map(async (uid) => {
      try {
        const userRef = db.doc(`users/${uid}`);
        const userSnap = await userRef.get();
        const cur: string[] = (userSnap.get('fcmTokens') || []) as string[];
        const next = cur.filter((t) => !deadTokens.includes(t));
        if (next.length !== cur.length) await userRef.update({ fcmTokens: next });
      } catch {}
    }));
  }
});

// SKTaxi: 단일 카테고리 RSS 처리 (upload-notices.js와 동일한 정책)
async function processSingleCategory(category: string, categoryId: number, rowCount: number) {
  const rssUrl = `${RSS_BASE_URL}/${categoryId}/rssList.do?row=${rowCount}`;
  
  try {
    const feed = await parser.parseURL(rssUrl);
    console.log(`📊 ${category} RSS 파싱 성공: ${feed.items.length}개 아이템`);
    // SKTaxi: 원본 RSS 파싱 결과를 JSON으로 전체 출력 (디버깅용)
    try {
      console.log(`🧾 ${category} RSS 원본 아이템(JSON)`, JSON.stringify(feed.items, null, 2));
    } catch (e) {
      console.warn(`원본 아이템 JSON 직렬화 실패 (${category}):`, e);
    }
    
    return feed.items.map((item: any, index: number) => {
      // 절대 링크 보정
      const fullLink = item.link?.startsWith('http')
        ? item.link
        : `https://www.sungkyul.ac.kr${item.link || ''}`;

      const title = (item.title || '').trim();
      const content = (item.description || item.content || item.contentSnippet || '').toString().trim();
      // 타임존: isoDate는 무시, pubDate(한국시간)를 그대로 사용
      const rawDate = (item.pubDate || '').toString().trim();
      const author = (item.author || '').trim();
      // 🔑 안정적인 문서 ID: 링크 기반 (upload-notices.js와 동일)
      const stableId = Buffer.from(fullLink || `${categoryId}:${title}`)
        .toString('base64')
        .replace(/=+$/, '')
        .slice(0, 120);

      // ✳️ 변경 감지를 위한 contentHash (upload-notices.js와 동일)
      const crypto = require('crypto');
      const contentHash = crypto
        .createHash('sha1')
        .update(`${title}|${fullLink}|${rawDate}`)
        .digest('hex');

      // SKTaxi: pubDate를 한국시간(KST)으로만 해석 (isoDate 무시)
      let postedAt = admin.firestore.FieldValue.serverTimestamp();
      try {
        if (rawDate) {
          const src = String(rawDate).trim();
          // 'YYYY-MM-DD HH:mm:ss' → 'YYYY-MM-DDTHH:mm:ss'
          const normalized = src.includes('T') ? src : src.replace(' ', 'T');
          const parsed = new Date(normalized + '+09:00');
          if (!isNaN(parsed.getTime())) {
            postedAt = admin.firestore.Timestamp.fromDate(parsed);
          }
        }
      } catch (error) {
        console.warn(`날짜 파싱 실패 (${title}):`, error);
      }

      return {
        id: stableId,
        title: title || '제목 없음',
        content,
        link: fullLink,
        postedAt, // SKTaxi: Timestamp 형식만 사용
        category,
        author: author,
        department: '성결대학교',
        source: 'RSS',
        contentHash,
      };
    });
  } catch (error) {
    console.error(`❌ ${category} RSS 처리 실패:`, error);
    return []; // 실패한 카테고리는 빈 배열 반환
  }
}

// SKTaxi: 10분마다 자동으로 새/변경된 공지사항만 반영 (개별 처리)
export const scheduledRSSFetch = onSchedule({
  schedule: '*/10 * * * *',
  timeZone: 'Asia/Seoul',
  timeoutSeconds: 540
}, async (event) => {
  try {
    console.log('⏰ 스케줄된 RSS 가져오기 시작...');
    
    const db = admin.firestore();
    const results = [];
    
    // SKTaxi: 각 카테고리를 개별적으로 처리 (타임아웃 방지)
    for (const [category, categoryId] of Object.entries(NOTICE_CATEGORIES)) {
      try {
        console.log(`📂 ${category} 카테고리 처리 시작...`);
        
        const notices = await processSingleCategory(category, categoryId, 10); // SKTaxi: 10분마다 10개씩 처리
        console.log(`📊 ${category} 카테고리 처리 완료: ${notices.length}개`);
        
        if (notices.length === 0) {
          console.log(`⚠️ ${category} 카테고리: 처리할 공지사항이 없습니다.`);
          results.push({ category, count: 0, success: true });
          continue;
        }

        // SKTaxi: upload-notices.js와 동일한 배치 저장 정책
        let batch = db.batch();
        let operationCount = 0;
        const COMMIT_THRESHOLD = 450;

        for (const notice of notices) {
          try {
            const docRef = db.collection('notices').doc(notice.id);
            
            // SKTaxi: 기존 문서 확인
            const existingDoc = await docRef.get();
            
            if (!existingDoc.exists) {
              // SKTaxi: 새 문서 생성
              const { html: contentDetail, attachments: contentAttachments } = await crawlNoticeContent(notice.link);

              // include contentAttachments (structured objects) in the stored document as well
              batch.set(docRef, {
                ...notice,
                contentDetail,
                contentAttachments,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });
              operationCount++;
            } else {
              // SKTaxi: 기존 문서의 contentHash와 비교
              const existingData = existingDoc.data();
              if (existingData?.contentHash !== notice.contentHash) {
                // SKTaxi: 내용이 변경된 경우에만 업데이트
                batch.set(docRef, {
                  ...notice,
                  updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                operationCount++;
              }
            }
            
            // SKTaxi: 배치 제한에 도달하면 커밋하고 새 배치 생성 (upload-notices.js와 동일)
            if (operationCount >= COMMIT_THRESHOLD) {
              await batch.commit();
              console.log(`✅ ${category} 배치 커밋 완료: ${operationCount}개 작업`);
              batch = db.batch(); // SKTaxi: 새 배치 생성
              operationCount = 0;
            }
          } catch (error) {
            console.error(`❌ ${category} 공지사항 저장 실패 (${notice.title}):`, error);
          }
        }

        // SKTaxi: 남은 작업 커밋
        if (operationCount > 0) {
          await batch.commit();
          console.log(`✅ ${category} 최종 배치 커밋 완료: ${operationCount}개 작업`);
        }
        
        results.push({ category, count: notices.length, success: true });
        console.log(`✅ ${category} 카테고리 완료`);
        
      } catch (error: any) {
        console.error(`❌ ${category} 카테고리 처리 실패:`, error);
        results.push({ category, count: 0, success: false, error: error.message });
      }
    }

    const totalCount = results.reduce((sum, result) => sum + result.count, 0);
    const successCount = results.filter(result => result.success).length;
    
    console.log(`✅ 스케줄된 RSS 가져오기 완료: ${successCount}/${results.length}개 카테고리 성공, 총 ${totalCount}개 공지사항`);
    
  } catch (error) {
    console.error('❌ 스케줄된 RSS 가져오기 실패:', error);
  }
});


// SKTaxi: 공지사항 본문을 HTML로 크롤링 (이미지 포함)

export async function crawlNoticeContent(noticeUrl: string): Promise<{ html: string; attachments: { name: string; downloadUrl: string; previewUrl: string }[] }> {
  try {
    const resp = await axios.get(noticeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const $ = cheerio.load(resp.data);

    // 공지 본문 HTML (.view-con)
    const $viewCon = $('.view-con');
    $viewCon.find('img').each((_, img) => {
      const $img = $(img);
      const src = $img.attr('src');
      if (src && src.startsWith('/')) {
        $img.attr('src', `${BASE_URL}${src}`);
      }
    });
    const contentHtml = $viewCon.html() || '';

    // 첨부파일 리스트 (.view-file)
    const attachments: { name: string; downloadUrl: string; previewUrl: string }[] = [];
    const $viewFile = $('.view-file');

    $viewFile.find('li').each((_, li) => {
      const $li = $(li);
      const $links = $li.find('a');
      let name = '';
      let downloadUrl = '';
      let previewUrl = '';

      $links.each((__, aEl) => {
        const $a = $(aEl);
        const href = ($a.attr('href') || '').trim();
        const text = $a.text().trim();
        if (text && !name) name = text;

        if (!href) return;
        let url = href;
        if (href.startsWith('/')) {
          url = `${BASE_URL}${href}`;
        } else if (!href.startsWith('http://') && !href.startsWith('https://')) {
          url = `${BASE_URL}/${href}`.replace(/([^:]\/\/)\/+/, '$1');
        }

        if (href.includes('download.do')) {
          downloadUrl = url;
        } else if (href.includes('synapView.do')) {
          previewUrl = url;
        }
      });

      if (name || downloadUrl || previewUrl) {
        attachments.push({ name, downloadUrl, previewUrl });
      }
    });

    return { html: contentHtml, attachments };
  } catch (error) {
    console.error(`❌ 공지 크롤링 실패 (${noticeUrl}):`, error);
    return { html: '', attachments: [] };
  }
}

// SKTaxi: 새로운 공지사항이 추가될 때 push 알림 전송
export const onNoticeCreated = onDocumentCreated(
  {
    document: 'notices/{noticeId}',
    region: 'asia-northeast3'
  },
  async (event) => {
    const noticeData = event.data?.data();
    const noticeId = event.params.noticeId;
    
    if (!noticeData) {
      console.error('❌ 공지사항 데이터가 없습니다:', noticeId);
      return;
    }

    console.log(`📢 새로운 공지사항 감지: ${noticeData.title}`);

    try {
      // 1. 알림 설정이 활성화된 사용자들 조회
      const usersSnapshot = await db.collection('users').get();
      const targetUsers: string[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const notificationSettings = userData.notificationSettings;
        
        // 공지사항 알림이 활성화된 사용자만 필터링
        if (notificationSettings?.allNotifications && 
            notificationSettings?.noticeNotifications) {
          targetUsers.push(userDoc.id);
        }
      }

      if (targetUsers.length === 0) {
        console.log('📢 알림을 받을 사용자가 없습니다.');
        return;
      }

      console.log(`📢 알림 대상 사용자 수: ${targetUsers.length}명`);

      // 2. FCM 토큰이 있는 사용자들 조회 (유효성 검사 포함)
      const fcmTokens: string[] = [];
      for (const userId of targetUsers) {
        try {
          const userDoc = await db.collection('users').doc(userId).get();
          const userData = userDoc.data();
          if (userData?.fcmTokens && Array.isArray(userData.fcmTokens)) {
            // FCM 토큰 유효성 기본 검사
            const validTokens = userData.fcmTokens.filter((token: string) => 
              token && 
              typeof token === 'string' && 
              token.length > 10 && 
              !token.includes('undefined') &&
              !token.includes('null')
            );
            fcmTokens.push(...validTokens);
          }
        } catch (error) {
          console.error(`❌ 사용자 ${userId} FCM 토큰 조회 실패:`, error);
        }
      }

      if (fcmTokens.length === 0) {
        console.log('📢 유효한 FCM 토큰이 있는 사용자가 없습니다.');
        return;
      }

      console.log(`📢 유효한 FCM 토큰 수: ${fcmTokens.length}개`);

      // 3. Push 알림 메시지 구성 (사용하지 않음 - 단순화된 메시지 사용)

      // 4. FCM으로 알림 전송 (운영 모드)
      const BATCH_SIZE = 500; // FCM 배치 크기 제한
      let totalSuccess = 0;
      let totalFailure = 0;
      const allFailedTokens: string[] = [];

      // 실제 공지사항 알림 메시지 구성
      const message = {
        notification: {
          title: `📢 새 성결대 ${noticeData.category} 공지`,
          body: noticeData.title,
        },
        data: {
          type: 'notice',
          noticeId: noticeId,
          category: noticeData.category || '일반',
          title: noticeData.title || '',
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#4CAF50',
            sound: 'default',
            channelId: 'notice_channel',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              //badge: 1,
            },
          },
        },
      };

      // 배치별로 FCM 전송
      for (let i = 0; i < fcmTokens.length; i += BATCH_SIZE) {
        const batchTokens = fcmTokens.slice(i, i + BATCH_SIZE);
        const batchMessage = {
          ...message,
          tokens: batchTokens
        };

        try {
          const response = await fcm.sendEachForMulticast(batchMessage);
          
          console.log(`📢 배치 ${Math.floor(i / BATCH_SIZE) + 1} 전송 완료:`);
          console.log(`  - 성공: ${response.successCount}개`);
          console.log(`  - 실패: ${response.failureCount}개`);

          totalSuccess += response.successCount;
          totalFailure += response.failureCount;

          // 실패한 토큰들 수집
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              allFailedTokens.push(batchTokens[idx]);
              console.error(`❌ FCM 전송 실패 (${batchTokens[idx].substring(0, 20)}...):`, resp.error?.code || 'Unknown error');
            }
          });

        } catch (error: any) {
          console.error(`❌ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 전송 실패:`, error);
          totalFailure += batchTokens.length;
          allFailedTokens.push(...batchTokens);
        }
      }

      console.log(`📢 전체 Push 알림 전송 완료:`);
      console.log(`  - 총 성공: ${totalSuccess}개`);
      console.log(`  - 총 실패: ${totalFailure}개`);

      // 5. 실패한 토큰들 정리
      if (allFailedTokens.length > 0) {
        console.log(`🧹 실패한 토큰 ${allFailedTokens.length}개 정리 중...`);
        await cleanupFailedTokens(allFailedTokens);
      }

    } catch (error) {
      console.error('❌ Push 알림 전송 실패:', error);
    }
  }
);

// SKTaxi: 실패한 FCM 토큰들을 사용자 문서에서 제거
async function cleanupFailedTokens(failedTokens: string[]) {
  try {
    console.log(`🧹 ${failedTokens.length}개의 실패한 토큰 정리 시작...`);
    
    const usersSnapshot = await db.collection('users').get();
    let cleanedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const fcmTokens = userData?.fcmTokens;
      
      if (fcmTokens && Array.isArray(fcmTokens)) {
        const validTokens = fcmTokens.filter(token => !failedTokens.includes(token));
        
        if (validTokens.length !== fcmTokens.length) {
          try {
            await userDoc.ref.update({
              fcmTokens: validTokens
            });
            cleanedCount += fcmTokens.length - validTokens.length;
            console.log(`🧹 사용자 ${userDoc.id}: ${fcmTokens.length - validTokens.length}개 토큰 제거 (${validTokens.length}개 남음)`);
          } catch (updateError) {
            console.error(`❌ 사용자 ${userDoc.id} 토큰 업데이트 실패:`, updateError);
          }
        }
      }
    }
    
    console.log(`✅ 총 ${cleanedCount}개의 실패한 토큰 정리 완료`);
  } catch (error) {
    console.error('❌ 실패한 FCM 토큰 정리 실패:', error);
  }
}