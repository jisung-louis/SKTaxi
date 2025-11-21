import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onValueCreated } from 'firebase-functions/v2/database';
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

const MINECRAFT_CHAT_ROOM_ID = 'game-minecraft';

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

// SKTaxi: 4시간마다 12시간 초과 파티 자동 삭제
export const cleanupOldParties = onSchedule({ schedule: 'every 4 hours', timeZone: 'Asia/Seoul' }, async () => {
  try {
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - twelveHoursMs);
    const cutoffTs = admin.firestore.Timestamp.fromDate(cutoffDate);

    console.log(`🧹 CleanupOldParties 시작 - 기준시각: ${cutoffDate.toISOString()}`);

    // 페이지네이션으로 반복 삭제 (배치 400개 단위)
    const pageSize = 400;
    let totalDeleted = 0;

    while (true) {
      const snap = await db
        .collection('parties')
        .where('createdAt', '<', cutoffTs)
        .orderBy('createdAt', 'asc')
        .limit(pageSize)
        .get();

      if (snap.empty) break;

      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      totalDeleted += snap.size;
      console.log(`🗑️ 삭제 진행: ${snap.size}건 (누적 ${totalDeleted})`);

      // 다음 루프에서 추가 삭제 계속
      if (snap.size < pageSize) break;
    }

    console.log(`✅ CleanupOldParties 완료 - 총 삭제: ${totalDeleted}건`);
  } catch (error) {
    console.error('❌ CleanupOldParties 실패:', error);
  }
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

// SKTaxi: userNotifications 생성 헬퍼 함수
async function createUserNotification(userId: string, notificationData: {
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  try {
    const notificationRef = db.collection('userNotifications')
      .doc(userId)
      .collection('notifications')
      .doc();
    
    await notificationRef.set({
      id: notificationRef.id,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`✅ userNotification 생성 완료: ${userId} - ${notificationData.type}`);
  } catch (error) {
    console.error(`❌ userNotification 생성 실패 (${userId}):`, error);
  }
}

// SKTaxi: 파티 생성 알림 (모든 유저에게 전송)
export const onPartyCreate = onDocumentCreated('parties/{partyId}', async (event) => {
  const snap = event.data;
  if (!snap) return;
  const partyData = snap.data() as any;
  const leaderId = partyData?.leaderId as string | undefined;
  const partyId = String(event.params.partyId || '');
  
  if (!leaderId || !partyData) return;
  
  try {
    // 모든 유저의 FCM 토큰 수집 (리더 제외, 택시 알림 해제 유저 제외)
    const tokens: string[] = [];
    const allUsersSnapshot = await db.collection('users').get();
    
    for (const userDoc of allUsersSnapshot.docs) {
      const userId = userDoc.id;
      
      // 리더는 제외
      if (userId === leaderId) continue;
      
      // 택시 알림 설정 확인
      const notificationSettings = userDoc.get('notificationSettings') || {};
      const partyNotificationsEnabled = notificationSettings.partyNotifications !== false; // 기본값 true
      
      // 파티 알림이 해제된 유저는 제외
      if (!partyNotificationsEnabled) continue;
      
      const userTokens: string[] = (userDoc.get('fcmTokens') || []) as string[];
      tokens.push(...userTokens);
    }
    
    if (tokens.length === 0) return;
    
    // Push 알림 메시지 구성
    const departureName = partyData.departure?.name || '출발지';
    const destinationName = partyData.destination?.name || '목적지';
    
    // 시간 포맷팅 (UTC에서 한국 시간으로 변환: +9시간)
    let departureTimeStr = '출발 시간';
    if (partyData.departureTime) {
      const date = new Date(partyData.departureTime);
      // UTC 시간에 9시간 추가
      const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      
      let hours = kstDate.getUTCHours();
      const minutes = kstDate.getUTCMinutes().toString().padStart(2, '0');
      
      // 오전/오후 판단
      const isAM = hours < 12;
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      
      const ampm = isAM ? '오전' : '오후';
      const hoursStr = hours.toString();
      
      departureTimeStr = `${ampm} ${hoursStr}시 ${minutes}분`;
    }
    
    const titleText = `${departureName} → ${destinationName} 택시 파티 등장`;
    const bodyText = `${departureTimeStr}에 ${departureName}에서 ${destinationName}로 가는 파티가 등장했어요.\n동승 요청 해보세요!`;
    
    const message = {
      tokens,
      notification: {
        title: titleText,
        body: bodyText,
      },
      data: {
        type: 'party_created',
        partyId,
      },
      apns: { payload: { aps: { sound: 'default' } } },
      android: { priority: 'high' as const },
    };
    
    const resp = await fcm.sendEachForMulticast(message as any);
    console.log(`📢 새 파티 생성 알림 전송: 성공 ${resp.successCount}, 실패 ${resp.failureCount}`);
    
    // 실패한 토큰 정리
    const failedTokens: string[] = [];
    resp.responses.forEach((r, idx) => {
      if (!r.success) failedTokens.push((message as any).tokens[idx]);
    });
    
    if (failedTokens.length) {
      // 각 유저 문서에서 죽은 토큰 제거
      for (const userDoc of allUsersSnapshot.docs) {
        const userId = userDoc.id;
        if (userId === leaderId) continue; // 리더는 제외
        
        const notificationSettings = userDoc.get('notificationSettings') || {};
        const partyNotificationsEnabled = notificationSettings.partyNotifications !== false;
        if (!partyNotificationsEnabled) continue;
        
        try {
          const userRef = db.doc(`users/${userId}`);
          const cur: string[] = (userDoc.get('fcmTokens') || []) as string[];
          const next = cur.filter((t) => !failedTokens.includes(t));
          if (next.length !== cur.length) {
            await userRef.update({ fcmTokens: next });
          }
        } catch (error) {
          console.error(`❌ 사용자 ${userId} 토큰 업데이트 실패:`, error);
        }
      }
    }
  } catch (error) {
    console.error('❌ 새 파티 생성 알림 전송 실패:', error);
  }
});

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
  
  // SKTaxi: userNotification 생성
  await createUserNotification(leaderId, {
    type: 'party_join_request',
    title: '동승 요청이 도착했어요',
    message: '앱에서 확인하고 수락/거절을 선택해주세요.',
    data: {
      partyId: String(req?.partyId || ''),
      requestId: String(event.params.requestId || ''),
      requesterId: String(req?.requesterId || ''),
    },
  });
});

// SKTaxi: 동승 요청 승인/거절 알림
export const onJoinRequestUpdate = onDocumentUpdated('joinRequests/{requestId}', async (event) => {
  if (!event.data) return;
  
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  
  // status가 변경되지 않았으면 무시
  if (beforeData.status === afterData.status) return;
  
  const status = afterData.status;
  const requesterId = afterData.requesterId;
  const partyId = afterData.partyId;
  
  if (!requesterId || !partyId) return;
  
  try {
    // 요청자의 FCM 토큰 가져오기
    const userDoc = await db.doc(`users/${requesterId}`).get();
    const tokens: string[] = (userDoc.get('fcmTokens') || []) as string[];
    
    if (tokens.length === 0) {
      console.log('📢 동승 요청 알림: FCM 토큰이 없습니다.');
      return;
    }
    
    let notification;
    let dataType;
    
    if (status === 'accepted') {
      notification = {
        title: '동승 요청이 승인되었어요',
        body: '파티에 합류하세요!',
      };
      dataType = 'party_join_accepted';
    } else if (status === 'declined') {
      notification = {
        title: '동승 요청이 거절되었어요',
        body: '다른 파티를 찾아보세요.',
      };
      dataType = 'party_join_rejected';
    } else {
      return;
    }
    
    const message = {
      tokens,
      notification,
      data: {
        type: dataType,
        partyId: String(partyId),
        requestId: String(event.params.requestId || ''),
        requesterId: String(requesterId),
      },
      apns: { payload: { aps: { sound: 'default' } } },
      android: { priority: 'high' as const },
    };
    
    const resp = await fcm.sendEachForMulticast(message as any);
    console.log(`📢 동승 요청 ${status} 알림 전송: 성공 ${resp.successCount}, 실패 ${resp.failureCount}`);
    
    // 실패한 토큰 정리
    const failedTokens: string[] = [];
    resp.responses.forEach((r, idx) => {
      if (!r.success) failedTokens.push((message as any).tokens[idx]);
    });
    
    if (failedTokens.length) {
      await db.runTransaction(async (tx) => {
        const ref = db.doc(`users/${requesterId}`);
        const snapUser = await tx.get(ref);
        const cur: string[] = (snapUser.get('fcmTokens') || []) as string[];
        const next = cur.filter((t) => !failedTokens.includes(t));
        tx.update(ref, { fcmTokens: next });
      });
    }
    
    // SKTaxi: userNotification 생성
    await createUserNotification(requesterId, {
      type: dataType,
      title: notification.title,
      message: notification.body,
      data: {
        partyId: String(partyId),
        requestId: String(event.params.requestId || ''),
        requesterId: String(requesterId),
      },
    });
  } catch (error) {
    console.error('❌ 동승 요청 알림 전송 실패:', error);
  }
});

// SKTaxi: 채팅방 메시지 생성 시 알림 (chatRooms)
export const onChatRoomMessageCreated = onDocumentCreated('chatRooms/{chatRoomId}/messages/{messageId}', async (event) => {
  console.log('🔔 onChatRoomMessageCreated 트리거됨');
  
  if (!event.data) {
    console.log('⚠️ event.data가 없음');
    return;
  }
  
  const messageData = event.data.data();
  const chatRoomId = event.params.chatRoomId;
  const senderId = messageData?.senderId;
  
  console.log(`📝 메시지 정보: chatRoomId=${chatRoomId}, senderId=${senderId}, type=${messageData?.type}`);
  
  if (!senderId || !chatRoomId) {
    console.log('⚠️ senderId 또는 chatRoomId가 없음');
    return;
  }
  
  try {
    // 채팅방 정보 조회 (문서 ID는 이제 base64 인코딩된 영문/숫자만 사용)
    const chatRoomDoc = await db.doc(`chatRooms/${chatRoomId}`).get();
    const chatRoomData = chatRoomDoc.data();
    
    if (!chatRoomData) {
      console.log(`⚠️ 채팅방 정보 없음: chatRoomId=${chatRoomId}`);
      return;
    }
    
    const members = Array.isArray(chatRoomData.members) ? chatRoomData.members : [];
    console.log(`👥 채팅방 멤버 수: ${members.length}명`);
    
    // 본인을 제외한 멤버들에게 알림
    const targetMembers = members.filter((memberId: string) => memberId !== senderId);
    console.log(`🎯 알림 대상 멤버 수: ${targetMembers.length}명`);
    
    // unreadCount 업데이트: 전송자를 제외한 모든 멤버의 unreadCount 증가
    const currentUnreadCount = chatRoomData.unreadCount || {};
    const updatedUnreadCount: { [key: string]: number } = { ...currentUnreadCount };
    
    for (const memberId of members) {
      if (memberId !== senderId) {
        // 전송자가 아닌 멤버의 unreadCount 증가
        updatedUnreadCount[memberId] = (updatedUnreadCount[memberId] || 0) + 1;
      } else {
        // 전송자는 unreadCount를 0으로 설정 (자신이 보낸 메시지는 읽음 처리)
        updatedUnreadCount[memberId] = 0;
      }
    }
    
    // 채팅방의 unreadCount 업데이트
    await db.doc(`chatRooms/${chatRoomId}`).update({
      unreadCount: updatedUnreadCount,
    });
    console.log(`📊 unreadCount 업데이트 완료`);
    
    if (targetMembers.length === 0) {
      console.log('⚠️ 알림 대상 멤버가 없음');
      return;
    }
    
    // 시스템 메시지는 기본적으로 Push 전송하지 않지만, 게임 채팅방은 예외
    if (messageData.type === 'system' && chatRoomData.type !== 'game') {
      console.log('⚠️ 시스템 메시지이므로 알림 전송 스킵 (game 제외)');
      return;
    }
    
    // FCM 토큰 수집 및 알림 설정 체크
    const tokens: string[] = [];
    const senderName = messageData.senderName || '익명';
    const messageText = messageData.text || '';
    
    console.log(`📨 메시지 내용: ${senderName}: ${messageText.substring(0, 30)}...`);
    
    for (const memberId of targetMembers) {
      try {
        // 채팅방별 알림 설정 체크
        const notificationSettingDoc = await db.doc(`users/${memberId}/chatRoomNotifications/${chatRoomId}`).get();
        const notificationData = notificationSettingDoc.data();
        // 문서가 없거나 enabled가 false가 아니면 기본값 true
        const isNotificationEnabled = notificationData?.enabled !== false;
        
        if (!isNotificationEnabled) {
          console.log(`⏭️ ${memberId}: 채팅방 알림이 꺼져있음`);
          continue;
        }
        
        // 사용자 알림 설정 체크 (전체 알림 설정)
        const userDoc = await db.doc(`users/${memberId}`).get();
        if (!userDoc.exists) {
          console.log(`⚠️ ${memberId}: 사용자 문서가 없음`);
          continue;
        }
        
        const userData = userDoc.data();
        const notificationSettings = (userData?.notificationSettings || {}) as any;
        const allNotificationsEnabled = notificationSettings.allNotifications !== false;
        
        if (!allNotificationsEnabled) {
          console.log(`⏭️ ${memberId}: 전체 알림이 꺼져있음`);
          continue;
        }
        
        const userTokens = (userData?.fcmTokens || []) as string[];
        const validTokens = userTokens.filter((t: string) => t && typeof t === 'string' && t.length > 10);
        
        if (validTokens.length === 0) {
          console.log(`⚠️ ${memberId}: 유효한 FCM 토큰이 없음 (총 ${userTokens.length}개 토큰 중)`);
        } else {
          console.log(`✅ ${memberId}: ${validTokens.length}개 토큰 추가`);
        }
        
        tokens.push(...validTokens);
      } catch (error) {
        console.error(`❌ ${memberId} 처리 중 오류:`, error);
      }
    }
    
    console.log(`📱 총 수집된 FCM 토큰: ${tokens.length}개`);
    
    if (tokens.length === 0) {
      console.log('⚠️ 전송할 FCM 토큰이 없음');
      return;
    }
    
    // Push 알림 메시지 구성
    const chatRoomTitle = chatRoomData.type === 'university' ? '성결대 전체 채팅방' : 
                         chatRoomData.type === 'department' ? `${chatRoomData.department} 채팅방` :
                         chatRoomData.name || '채팅방';
    
    const message = {
      tokens,
      notification: {
        title: chatRoomTitle,
        body: `${senderName}: ${messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText}`,
      },
      data: {
        type: 'chat_room_message',
        chatRoomId,
        messageId: event.params.messageId,
        senderId,
      },
      apns: { payload: { aps: { sound: 'default' } } },
      android: { priority: 'high' as const },
    };
    
    console.log(`📤 FCM 메시지 전송 시작: ${tokens.length}개 토큰`);
    
    const BATCH = 500;
    const failed: string[] = [];
    let successCount = 0;
    
    for (let i = 0; i < tokens.length; i += BATCH) {
      const chunk = tokens.slice(i, i + BATCH);
      try {
        const resp = await fcm.sendEachForMulticast({ ...message, tokens: chunk });
        resp.responses.forEach((r, idx) => { 
          if (!r.success) {
            failed.push(chunk[idx]);
            console.error(`❌ FCM 전송 실패 (${chunk[idx].substring(0, 20)}...):`, r.error?.code || 'Unknown error');
          } else {
            successCount++;
          }
        });
        console.log(`✅ 배치 ${Math.floor(i / BATCH) + 1}: 성공 ${resp.successCount}개, 실패 ${resp.failureCount}개`);
      } catch (error) {
        console.error(`❌ 배치 ${Math.floor(i / BATCH) + 1} 전송 실패:`, error);
        failed.push(...chunk);
      }
    }
    
    if (failed.length > 0) {
      console.log(`🧹 실패한 토큰 ${failed.length}개 정리 중...`);
      await Promise.all(targetMembers.map(async (uid) => {
        try {
          const userRef = db.doc(`users/${uid}`);
          const userSnap = await userRef.get();
          const cur: string[] = (userSnap.get('fcmTokens') || []);
          const next = cur.filter((t) => !failed.includes(t));
          if (next.length !== cur.length) {
            await userRef.update({ fcmTokens: next });
            console.log(`🧹 ${uid}: ${cur.length - next.length}개 토큰 제거`);
          }
        } catch (error) {
          console.error(`❌ ${uid} 토큰 정리 실패:`, error);
        }
      }));
    }
    
    console.log(`📢 채팅방 알림 전송 완료: ${chatRoomId}`);
    console.log(`  - 성공: ${successCount}개`);
    console.log(`  - 실패: ${failed.length}개`);
  } catch (error) {
    console.error('❌ 채팅방 알림 전송 실패:', error);
    console.error('스택 트레이스:', error instanceof Error ? error.stack : 'N/A');
  }
});

// SKTaxi: Minecraft RTDB 메시지를 Firestore로 동기화
export const syncMinecraftChatMessage = onValueCreated(
  {
    ref: 'mc_chat/messages/{messageId}',
    region: 'asia-southeast1',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('⚠️ Minecraft 메시지 스냅샷이 없습니다.');
      return;
    }

    const payload = snapshot.val() as Record<string, any> | null;
    if (!payload) {
      console.log('⚠️ Minecraft 메시지 데이터가 비어 있습니다.');
      return;
    }

    const messageId = event.params?.messageId;
    const chatRoomId = payload.chatRoomId || MINECRAFT_CHAT_ROOM_ID;
    const text = typeof payload.message === 'string' ? payload.message : '';
    const senderName = payload.username || '플레이어';
    const timestampMs = typeof payload.timestamp === 'number' ? payload.timestamp : Date.now();
    const createdAt = admin.firestore.Timestamp.fromMillis(timestampMs);
    const direction =
      payload.direction === 'app_to_mc'
        ? 'app_to_mc'
        : payload.direction === 'system'
          ? 'system'
          : 'mc_to_app';
    const appUserId = typeof payload.appUserId === 'string' ? payload.appUserId : null;
    const senderId = appUserId || `minecraft:${senderName}`;
    const readBy = appUserId ? [appUserId] : [];
    const messageType = direction === 'system' ? 'system' : 'text';

    if (!messageId || !chatRoomId) {
      console.log('⚠️ messageId 또는 chatRoomId가 없어 동기화를 중단합니다.');
      return;
    }

    try {
      const messageRef = db.doc(`chatRooms/${chatRoomId}/messages/${messageId}`);
      await messageRef.set(
        {
          text,
          senderId,
          senderName,
          type: messageType,
          createdAt,
          readBy,
          direction,
          source: 'minecraft',
          minecraftUuid: payload.uuid || null,
          appUserDisplayName: payload.appUserDisplayName || null,
        },
        { merge: false }
      );

      await db.doc(`chatRooms/${chatRoomId}`).set(
        {
          lastMessage: {
            text,
            senderId,
            senderName,
            timestamp: createdAt,
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`✅ Minecraft 메시지 동기화 완료: chatRoomId=${chatRoomId}, messageId=${messageId}`);
    } catch (error) {
      console.error('❌ Minecraft 메시지 동기화 실패:', error);
    }
  }
);

// SKTaxi: 채팅 메시지 생성 시 알림 (택시 파티용)
export const onChatMessageCreated = onDocumentCreated('chats/{partyId}/messages/{messageId}', async (event) => {
  if (!event.data) return;
  
  const messageData = event.data.data();
  const partyId = event.params.partyId;
  const senderId = messageData?.senderId;
  
  if (!senderId || !partyId) return;
  
  try {
    // 파티 정보 조회
    const partyDoc = await db.doc(`parties/${partyId}`).get();
    const partyData = partyDoc.data();
    
    if (!partyData) return;
    
    const members = Array.isArray(partyData.members) ? partyData.members : [];
    
    // 리더를 포함한 모든 멤버 중 본인을 제외한 멤버들에게 알림
    const targetMembers = members.filter((memberId: string) => memberId !== senderId);
    
    if (targetMembers.length === 0) return;
    
    // FCM 토큰 수집 및 채팅방 음소거 체크
    const tokens: string[] = [];
    const notificationType = messageData.type || 'message';
    const senderName = messageData.senderName || '익명';
    const messageText = messageData.text || '';
    
    // userNotification은 항상 생성 (앱 내부 알림용)
    for (const memberId of targetMembers) {
      try {
        // 채팅방 음소거 체크
        const settingsDoc = await db.doc(`chats/${partyId}/notificationSettings/${memberId}`).get();
        const settingsData = settingsDoc.data();
        const isMuted = settingsData?.muted || false;
        
        if (isMuted) {
          // 음소거된 경우 Push 전송 스킵
          continue;
        }
        
        const userDoc = await db.doc(`users/${memberId}`).get();
        const userTokens = (userDoc.get('fcmTokens') || []) as string[];
        tokens.push(...userTokens);
      } catch (error) {
        console.error(`Error processing member ${memberId}:`, error);
      }
    }
    
    // 시스템 메시지는 Push 전송하지 않음
    if (notificationType === 'system' || notificationType === 'account') {
      return;
    }
    
    if (tokens.length === 0) return;
    
    // Push 알림 메시지 구성
    const message = {
      tokens,
      notification: {
        title: `${senderName}님의 메시지`,
        body: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
      },
      data: {
        type: 'chat_message',
        partyId,
        messageId: event.params.messageId,
        senderId,
      },
      apns: { payload: { aps: { sound: 'default' } } },
      android: { priority: 'high' as const },
    };
    
    const resp = await fcm.sendEachForMulticast(message as any);
    console.log(`📢 채팅 알림 전송: 성공 ${resp.successCount}, 실패 ${resp.failureCount}`);
    
    // 실패한 토큰 정리
    const failedTokens: string[] = [];
    resp.responses.forEach((r, idx) => {
      if (!r.success) failedTokens.push((message as any).tokens[idx]);
    });
    
    if (failedTokens.length) {
      await Promise.all(targetMembers.map(async (uid) => {
        try {
          const userRef = db.doc(`users/${uid}`);
          const userSnap = await userRef.get();
          const cur: string[] = (userSnap.get('fcmTokens') || []) as string[];
          const next = cur.filter((t) => !failedTokens.includes(t));
          if (next.length !== cur.length) await userRef.update({ fcmTokens: next });
        } catch {}
      }));
    }
  } catch (error) {
    console.error('❌ 채팅 알림 전송 실패:', error);
  }
});

// SKTaxi: 파티 상태 변경 알림
export const onPartyStatusUpdate = onDocumentUpdated('parties/{partyId}', async (event) => {
  if (!event.data) return;
  
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  
  // status가 변경되지 않았으면 무시
  if (beforeData.status === afterData.status) return;
  
  const beforeStatus = beforeData.status;
  const afterStatus = afterData.status;
  
  // 알림을 보낼 상태 변경만 허용
  // 1. open -> closed (모집 마감)
  // 2. any -> arrived (도착) - 어떤 상태에서든 도착이면 알림
  // 3. closed -> open (모집 재개) - 이 경우는 리더만 하므로 알림 불필요
  const shouldNotify = (beforeStatus === 'open' && afterStatus === 'closed') || 
                       (afterStatus === 'arrived');
  
  if (!shouldNotify) {
    return;
  }
  
  const status = afterStatus;
  const members = Array.isArray(afterData.members) ? afterData.members : [];
  const leaderId = afterData.leaderId;
  
  // 리더를 제외한 멤버들에게만 알림 전송
  const memberIds = members.filter((memberId: string) => memberId !== leaderId);
  if (memberIds.length === 0) return;
  
  try {
    // 멤버들의 FCM 토큰 수집
    const tokens: string[] = [];
    for (const memberId of memberIds) {
      try {
        const userDoc = await db.doc(`users/${memberId}`).get();
        const userTokens = (userDoc.get('fcmTokens') || []) as string[];
        tokens.push(...userTokens);
        
        // userNotification은 항상 생성 (앱 내부 알림용)
        if (status === 'arrived') {
          await createUserNotification(memberId, {
            type: 'party_arrived',
            title: '택시가 목적지에 도착했어요',
            message: '정산을 진행해주세요.',
            data: { partyId: String(event.params.partyId || '') },
          });
        }
        // party_closed는 userNotification 생성하지 않음 (NotificationScreen에 표시하지 않음)
      } catch (error) {
        console.error(`Error getting tokens for user ${memberId}:`, error);
      }
    }
    
    if (tokens.length === 0) return;
    
    // Push 알림 메시지 구성
    let message: any;
    if (status === 'closed') {
      message = {
        tokens,
        notification: {
          title: '파티 모집이 마감되었어요',
          body: '리더가 파티 모집을 마감했습니다.',
        },
        data: {
          type: 'party_closed',
          partyId: String(event.params.partyId || ''),
        },
        apns: { payload: { aps: { sound: 'default' } } },
        android: { priority: 'high' as const },
      };
    } else if (status === 'arrived') {
      message = {
        tokens,
        notification: {
          title: '택시가 목적지에 도착했어요',
          body: '정산을 진행해주세요.',
        },
        data: {
          type: 'party_arrived',
          partyId: String(event.params.partyId || ''),
        },
        apns: { payload: { aps: { sound: 'default' } } },
        android: { priority: 'high' as const },
      };
    } else {
      return;
    }
    
    const resp = await fcm.sendEachForMulticast(message as any);
    console.log(`📢 파티 상태 변경 알림 전송: 성공 ${resp.successCount}, 실패 ${resp.failureCount}`);
    
    // 실패한 토큰 정리
    const failedTokens: string[] = [];
    resp.responses.forEach((r, idx) => {
      if (!r.success) failedTokens.push((message as any).tokens[idx]);
    });
    
    if (failedTokens.length) {
      await Promise.all(memberIds.map(async (uid) => {
        try {
          const userRef = db.doc(`users/${uid}`);
          const userSnap = await userRef.get();
          const cur: string[] = (userSnap.get('fcmTokens') || []) as string[];
          const next = cur.filter((t) => !failedTokens.includes(t));
          if (next.length !== cur.length) await userRef.update({ fcmTokens: next });
        } catch {}
      }));
    }
  } catch (error) {
    console.error('❌ 파티 상태 변경 알림 전송 실패:', error);
  }
});

// SKTaxi: 정산 완료 감지 및 알림 전송
export const onSettlementComplete = onDocumentUpdated('parties/{partyId}', async (event) => {
  if (!event.data) return;
  
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  
  // arrived 상태가 아니면 무시
  if (afterData.status !== 'arrived') return;
  
  // settlement가 없으면 무시
  if (!afterData.settlement || !afterData.settlement.members) return;
  
  const beforeSettlement = beforeData.settlement;
  const afterSettlement = afterData.settlement;
  
  // settlement.members가 있는지 확인
  if (!beforeSettlement || !beforeSettlement.members || !afterSettlement.members) return;
  
  const beforeMembers = Object.keys(beforeSettlement.members);
  const afterMembers = Object.keys(afterSettlement.members);
  
  // 모든 멤버가 settled가 되었는지 확인
  const allSettled = afterMembers.every((memberId: string) => {
    return afterSettlement.members[memberId]?.settled === true;
  });
  
  // 모든 멤버가 정산 완료되었는지, 그리고 이전에는 완료되지 않았는지 확인
  const wasIncomplete = beforeMembers.some((memberId: string) => {
    return !beforeSettlement.members[memberId]?.settled;
  });
  
  // 이미 완료된 상태였다면 무시
  if (!wasIncomplete) return;
  
  // 모든 멤버가 정산 완료된 경우에만 알림 전송
  if (!allSettled) return;
  
  const members = Array.isArray(afterData.members) ? afterData.members : [];
  if (members.length === 0) return;
  
  // 모든 멤버에게 알림 (리더 포함)
  const memberIds = members;
  
  try {
    const tokens: string[] = [];
    for (const memberId of memberIds) {
      try {
        const userDoc = await db.doc(`users/${memberId}`).get();
        const userTokens = (userDoc.get('fcmTokens') || []) as string[];
        tokens.push(...userTokens);
        
        // userNotification 생성
        await createUserNotification(memberId, {
          type: 'settlement_completed',
          title: '모든 정산이 완료되었어요',
          message: '동승 파티 종료 준비가 되었습니다.',
          data: { partyId: String(event.params.partyId || '') },
        });
      } catch (error) {
        console.error(`Error processing member ${memberId}:`, error);
      }
    }
    
    if (tokens.length === 0) return;
    
    const message = {
      tokens,
      notification: {
        title: '모든 정산이 완료되었어요',
        body: '동승 파티 종료 준비가 되었습니다.',
      },
      data: {
        type: 'settlement_completed',
        partyId: String(event.params.partyId || ''),
      },
      apns: { payload: { aps: { sound: 'default' } } },
      android: { priority: 'high' as const },
    };
    
    const resp = await fcm.sendEachForMulticast(message as any);
    console.log(`📢 정산 완료 알림 전송: 성공 ${resp.successCount}, 실패 ${resp.failureCount}`);
    
    // 실패한 토큰 정리
    const failedTokens: string[] = [];
    resp.responses.forEach((r, idx) => {
      if (!r.success) failedTokens.push((message as any).tokens[idx]);
    });
    
    if (failedTokens.length) {
      await Promise.all(memberIds.map(async (uid) => {
        try {
          const userRef = db.doc(`users/${uid}`);
          const userSnap = await userRef.get();
          const cur: string[] = (userSnap.get('fcmTokens') || []) as string[];
          const next = cur.filter((t) => !failedTokens.includes(t));
          if (next.length !== cur.length) await userRef.update({ fcmTokens: next });
        } catch {}
      }));
    }
  } catch (error) {
    console.error('❌ 정산 완료 알림 전송 실패:', error);
  }
});

// SKTaxi: 멤버 강퇴 감지 및 알림
export const onPartyMemberKicked = onDocumentUpdated('parties/{partyId}', async (event) => {
  if (!event.data) return;
  
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  
  const beforeMembers = Array.isArray(beforeData.members) ? beforeData.members : [];
  const afterMembers = Array.isArray(afterData.members) ? afterData.members : [];
  
  // members에서 사라진 멤버 찾기
  const kickedMembers = beforeMembers.filter((memberId: string) => !afterMembers.includes(memberId));
  
  if (kickedMembers.length === 0) return;
  
  const leaderId = afterData.leaderId;
  const partyId = String(event.params.partyId || '');
  const selfLeaveMemberId = afterData._selfLeaveMemberId;
  
  // 자가 나가기한 멤버인 경우 알림 전송하지 않음
  if (kickedMembers.length === 1 && kickedMembers[0] === selfLeaveMemberId) {
    console.log('🔔 자가 나가기 감지 - 알림 전송하지 않음');
    return;
  }
  
  // 강퇴당한 멤버에게 알림 전송
  for (const kickedMemberId of kickedMembers) {
    // 리더는 제외 (자신을 강퇴할 수 없음)
    if (kickedMemberId === leaderId) continue;
    
    try {
      // SKTaxi: 해당 파티와 관련된 userNotifications 삭제
      const notificationsRef = db.collection('userNotifications').doc(kickedMemberId).collection('notifications');
      const snapshot = await notificationsRef.where('data.partyId', '==', partyId).get();
      
      // 배치 삭제
      const batch = db.batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ 강퇴된 ${kickedMemberId}의 파티 관련 알림 ${snapshot.size}개 삭제 완료`);
      
      // FCM 토큰 가져오기
      const userDoc = await db.doc(`users/${kickedMemberId}`).get();
      const tokens: string[] = (userDoc.get('fcmTokens') || []) as string[];
      
      // userNotification 생성 (강퇴 알림은 남김, 다른 파티 알림만 삭제)
      await createUserNotification(kickedMemberId, {
        type: 'member_kicked',
        title: '파티에서 강퇴되었어요',
        message: '리더가 당신을 파티에서 나가게 했습니다.',
        data: { partyId },
      });
      
      if (tokens.length === 0) continue;
      
      const message = {
        tokens,
        notification: {
          title: '파티에서 강퇴되었어요',
          body: '리더가 당신을 파티에서 나가게 했습니다.',
        },
        data: {
          type: 'member_kicked',
          partyId: String(event.params.partyId || ''),
        },
        apns: { payload: { aps: { sound: 'default' } } },
        android: { priority: 'high' as const },
      };
      
      const resp = await fcm.sendEachForMulticast(message as any);
      console.log(`📢 멤버 강퇴 알림 전송 (${kickedMemberId}): 성공 ${resp.successCount}, 실패 ${resp.failureCount}`);
      
      // 실패한 토큰 정리
      const failedTokens: string[] = [];
      resp.responses.forEach((r, idx) => {
        if (!r.success) failedTokens.push((message as any).tokens[idx]);
      });
      
      if (failedTokens.length) {
        try {
          const userRef = db.doc(`users/${kickedMemberId}`);
          const userSnap = await userRef.get();
          const cur: string[] = (userSnap.get('fcmTokens') || []) as string[];
          const next = cur.filter((t) => !failedTokens.includes(t));
          if (next.length !== cur.length) await userRef.update({ fcmTokens: next });
        } catch (error) {
          console.error(`Failed to cleanup tokens for user ${kickedMemberId}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error processing kicked member ${kickedMemberId}:`, error);
    }
  }
});

// SKTaxi: 파티 삭제 시 멤버들에게 알림 전송
export const onPartyDelete = onDocumentDeleted('parties/{partyId}', async (event) => {
  const snap = event.data;
  if (!snap) return;
  const partyData = snap.data() as any;
  const members = partyData?.members as string[] | undefined;
  const leaderId = partyData?.leaderId as string | undefined;
  const partyId = String(event.params.partyId || '');
  
  if (!members || !Array.isArray(members) || members.length <= 1) return; // 리더만 있으면 알림 불필요

  // SKTaxi: 리더를 제외한 멤버들에게만 알림 전송
  const memberIds = members.filter((memberId: string) => memberId !== leaderId);
  if (memberIds.length === 0) return;
  
  // SKTaxi: 해당 파티와 관련된 userNotifications 삭제 (모든 멤버 + 리더)
  const allMembers = [...members];
  if (leaderId) {
    allMembers.push(leaderId);
  }
  
  for (const memberId of allMembers) {
    try {
      // 해당 파티와 관련된 알림 삭제
      const notificationsRef = db.collection('userNotifications').doc(memberId).collection('notifications');
      const snapshot = await notificationsRef.where('data.partyId', '==', partyId).get();
      
      // 배치 삭제
      const batch = db.batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      console.log(`✅ ${memberId}의 파티 관련 알림 ${snapshot.size}개 삭제 완료`);
    } catch (error) {
      console.error(`❌ ${memberId}의 파티 관련 알림 삭제 실패:`, error);
    }
  }

  // SKTaxi: 멤버들의 FCM 토큰 수집
  const tokens: string[] = [];
  for (const memberId of memberIds) {
    try {
      const userDoc = await db.doc(`users/${memberId}`).get();
      const userTokens = (userDoc.get('fcmTokens') || []) as string[];
      tokens.push(...userTokens);
      
      // userNotification은 항상 생성 (앱 내부 알림용)
      await createUserNotification(memberId, {
        type: 'party_deleted',
        title: '파티가 해체되었어요',
        message: '리더가 파티를 해체했습니다.',
        data: {
          partyId: String(event.params.partyId || ''),
        },
      });
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
  schedule: '*/10 8-20 * * 1-5',
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
        const notificationSettings = userData.notificationSettings || {};
        const noticeOn = notificationSettings.allNotifications !== false && notificationSettings.noticeNotifications !== false;

        if (!noticeOn) {
          continue; // 전체/공지 알림이 꺼져 있으면 스킵
        }

        // 카테고리별 필터링: 상세 설정이 존재하면 그 값을 우선 사용, 없으면 기본 허용
        const details = (notificationSettings.noticeNotificationsDetail || {}) as any;
        const categoryKey = String(noticeData.category || '').trim();
        let allow = true;
        if (categoryKey) {
          // 카테고리 라벨 → 내부 키 매핑(클라이언트와 동일 규칙)
          const key = categoryKey === '새소식' ? 'news'
            : categoryKey === '학사' ? 'academy'
            : categoryKey === '학생' ? 'student'
            : categoryKey === '장학/등록/학자금' ? 'scholarship'
            : categoryKey === '입학' ? 'admission'
            : categoryKey === '취업/진로개발/창업' ? 'career'
            : categoryKey === '공모/행사' ? 'event'
            : categoryKey === '교육/글로벌' ? 'education'
            : categoryKey === '일반' ? 'general'
            : categoryKey === '입찰구매정보' ? 'procurement'
            : categoryKey === '사회봉사센터' ? 'volunteer'
            : categoryKey === '장애학생지원센터' ? 'accessibility'
            : categoryKey === '생활관' ? 'dormitory'
            : categoryKey === '비교과' ? 'extracurricular'
            : 'general';
          if (Object.prototype.hasOwnProperty.call(details, key)) {
            allow = details[key] !== false;
          }
        }

        if (allow) {
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

      // 6. SKTaxi: 각 사용자에게 userNotification 생성
      await Promise.all(targetUsers.map(async (userId) => {
        await createUserNotification(userId, {
          type: 'notice',
          title: `📢 새 성결대 ${noticeData.category} 공지`,
          message: noticeData.title,
          data: {
            noticeId: noticeId,
            category: noticeData.category || '일반',
            title: noticeData.title || '',
          },
        });
      }));

    } catch (error) {
      console.error('❌ Push 알림 전송 실패:', error);
    }
  }
);

// SKTaxi: 새로운 앱 공지(appNotices) 생성 시 시스템 알림 허용 유저에게 푸시 전송
export const onAppNoticeCreated = onDocumentCreated(
  {
    document: 'appNotices/{appNoticeId}',
    region: 'asia-northeast3'
  },
  async (event) => {
    const appNotice = event.data?.data();
    const appNoticeId = event.params.appNoticeId;
    if (!appNotice) return;

    try {
      const isUrgent = appNotice.priority === 'urgent';
      
      // 1) 알림 설정 필터: urgent가 아닌 경우에만 필터링
      // urgent인 경우 알림 설정과 상관없이 모든 유저에게 전송
      const usersSnapshot = await db.collection('users').get();
      const targetUserIds: string[] = [];
      for (const userDoc of usersSnapshot.docs) {
        if (isUrgent) {
          // urgent인 경우 모든 유저 포함
          targetUserIds.push(userDoc.id);
        } else {
          // 일반 공지는 알림 설정 확인
        const settings = (userDoc.data().notificationSettings || {}) as any;
        const allow = settings.allNotifications !== false && settings.systemNotifications !== false;
        if (allow) targetUserIds.push(userDoc.id);
        }
      }
      if (!targetUserIds.length) return;

      // 2) FCM 토큰 수집(기본 유효성 검사)
      const tokens: string[] = [];
      for (const uid of targetUserIds) {
        try {
          const u = await db.collection('users').doc(uid).get();
          const list = (u.data()?.fcmTokens || []) as string[];
          const valid = list.filter((t) => t && typeof t === 'string' && t.length > 10 && !t.includes('undefined') && !t.includes('null'));
          tokens.push(...valid);
        } catch {}
      }
      if (!tokens.length) return;

      // 3) 메시지 구성 및 전송
      const title = '새로운 스쿠리 공지사항!';
      const body = String(appNotice.title || '새 앱 공지');
      const messageBase: any = {
        notification: { title, body },
        data: {
          type: 'app_notice',
          appNoticeId: String(appNoticeId || ''),
          title: String(appNotice.title || ''),
        },
        apns: { payload: { aps: { sound: 'default' } } },
        android: { priority: 'high' as const },
      };

      const BATCH = 500;
      const failed: string[] = [];
      for (let i = 0; i < tokens.length; i += BATCH) {
        const chunk = tokens.slice(i, i + BATCH);
        const resp = await fcm.sendEachForMulticast({ ...messageBase, tokens: chunk });
        resp.responses.forEach((r, idx) => { if (!r.success) failed.push(chunk[idx]); });
      }

      if (failed.length) await cleanupFailedTokens(failed);

      // 4) 내부 userNotification 생성
      await Promise.all(targetUserIds.map((uid) => createUserNotification(uid, {
        type: 'app_notice',
        title: String(appNotice.title || ''),
        message: String(appNotice.content || ''),
        data: { appNoticeId: String(appNoticeId || '') },
      })));
    } catch (e) {
      console.error('❌ 앱 공지 푸시 전송 실패:', e);
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

// SKTaxi: 게시판 댓글 생성 시 알림 전송
export const onBoardCommentCreated = onDocumentCreated('boardComments/{commentId}', async (event) => {
  const commentData = event.data?.data();
  const commentId = event.params.commentId;
  
  if (!commentData || commentData.isDeleted) return;
  
  const { postId, authorId, parentId, content } = commentData;
  
  try {
    // 1. 게시글 정보 조회
    const postDoc = await db.doc(`boardPosts/${postId}`).get();
    const postData = postDoc.data();
    
    if (!postData) return;
    
    // 2. targetUserId 결정 및 자기 자신 제외 규칙 분기
    // - 최상위 댓글: 게시글 작성자에게 알림, 단 본인이 자기 글에 단 댓글이면 제외
    // - 답글: 부모 댓글 작성자에게 알림, 단 본인이 자기 댓글에 단 답글이면 제외
    let targetUserId: string;
    if (parentId) {
      // 답글인 경우: 부모 댓글 작성자 조회
      const parentDoc = await db.doc(`boardComments/${parentId}`).get();
      const parentData = parentDoc.data();
      if (!parentData) return;
      targetUserId = parentData.authorId;
      // 본인이 자신의 댓글에 단 답글이면 제외
      if (authorId === targetUserId) return;
    } else {
      // 최상위 댓글: 게시글 작성자에게 알림
      targetUserId = postData.authorId;
      // 본인이 자신의 글에 단 댓글이면 제외
        if (authorId === targetUserId) return;
    }
    
    // 4. 알림 타입 결정
    const notificationType = parentId ? 'board_comment_reply' : 'board_post_comment';
    
    // 5. 사용자 알림 설정 확인
    const userDoc = await db.doc(`users/${targetUserId}`).get();
    const userData = userDoc.data();
    const notificationSettings = userData?.notificationSettings || {};
    
    // 게시판 댓글 알림이 해제된 유저는 제외
    const boardCommentNotificationsEnabled = notificationSettings.boardCommentNotifications !== false;
    
    if (!boardCommentNotificationsEnabled) {
      console.log(`📢 ${targetUserId}의 게시판 댓글 알림이 해제되어 있음`);
      return;
    }
    
    // 6. userNotification 생성
    await createUserNotification(targetUserId, {
      type: notificationType,
      title: parentId 
        ? '내 댓글에 답글이 달렸어요'
        : '내 게시글에 댓글이 달렸어요',
      message: content,
      data: { postId, commentId },
    });
    
    // 7. FCM 토큰 조회 및 Push 전송
    const tokens: string[] = (userData?.fcmTokens || []) as string[];
    
    if (tokens.length === 0) return;
    
    const message = {
      tokens,
      notification: {
        title: parentId 
          ? '내 댓글에 답글이 달렸어요'
          : '내 게시글에 댓글이 달렸어요',
        body: content.length > 50 ? content.substring(0, 50) + '...' : content,
      },
      data: {
        type: notificationType,
        postId,
        commentId,
      },
      apns: { payload: { aps: { sound: 'default' } } },
      android: { priority: 'high' as const },
    };
    
    const resp = await fcm.sendEachForMulticast(message as any);
    console.log(`📢 게시판 댓글 알림 전송: 성공 ${resp.successCount}, 실패 ${resp.failureCount}`);
    
    // 실패한 토큰 정리
    const failedTokens: string[] = [];
    resp.responses.forEach((r, idx) => {
      if (!r.success) failedTokens.push((message as any).tokens[idx]);
    });
    
    if (failedTokens.length) {
      try {
        const userRef = db.doc(`users/${targetUserId}`);
        const cur: string[] = (userData?.fcmTokens || []) as string[];
        const next = cur.filter((t) => !failedTokens.includes(t));
        if (next.length !== cur.length) await userRef.update({ fcmTokens: next });
      } catch (error) {
        console.error(`❌ 사용자 ${targetUserId} 토큰 업데이트 실패:`, error);
      }
    }
  } catch (error) {
    console.error('❌ 게시판 댓글 알림 전송 실패:', error);
  }
});

// SKTaxi: 공지사항 댓글 생성 시 알림 전송
export const onNoticeCommentCreated = onDocumentCreated('noticeComments/{commentId}', async (event) => {
  const commentData = event.data?.data();
  
  if (!commentData) return;
  
  const { userId, content, parentId, noticeId } = commentData;
  
  try {
    // 1. 공지사항 정보 조회
    const noticeDoc = await db.doc(`notices/${noticeId}`).get();
    const noticeData = noticeDoc.data();
    
    if (!noticeData) return;
    
    // 2. 본인 댓글/답글에는 알림 전송하지 않음
    if (userId === (parentId ? (await db.doc(`noticeComments/${parentId}`).get()).data()?.userId : noticeData.authorId)) return;
    
    // 3. 대상 사용자 결정
    const targetUserId = parentId 
      ? (await db.doc(`noticeComments/${parentId}`).get()).data()?.userId
      : noticeData.authorId;
    
    if (!targetUserId || targetUserId === userId) return;
    
    // 4. 댓글 타입 결정
    const notificationType = parentId ? 'notice_comment_reply' : 'notice_post_comment';
    
    // 5. 사용자 알림 설정 확인
    const userDoc = await db.doc(`users/${targetUserId}`).get();
    const userData = userDoc.data();
    const notificationSettings = userData?.notificationSettings || {};
    
    // 게시판 댓글 알림이 해제된 유저는 제외 (공지사항 댓글도 동일한 설정 사용)
    const boardCommentNotificationsEnabled = notificationSettings.boardCommentNotifications !== false;
    
    if (!boardCommentNotificationsEnabled) {
      console.log(`📢 ${targetUserId}의 댓글 알림이 해제되어 있음 (게시판/공지사항 댓글/답글 모두 포함)`);
      return;
    }
    
    // 7. userNotification 생성
    await createUserNotification(targetUserId, {
      type: notificationType,
      title: parentId 
        ? '내 댓글에 답글이 달렸어요'
        : '내 게시글에 댓글이 달렸어요',
      message: content,
      data: { noticeId, commentId: event.params.commentId },
    });
    
    // 8. FCM 토큰 조회 및 Push 전송
    const tokens: string[] = (userData?.fcmTokens || []) as string[];
    
    if (tokens.length === 0) return;
    
    const message = {
      tokens,
      notification: {
        title: parentId 
          ? '내 댓글에 답글이 달렸어요'
          : '내 게시글에 댓글이 달렸어요',
        body: content.length > 50 ? content.substring(0, 50) + '...' : content,
      },
      data: {
        type: notificationType,
        noticeId,
        commentId: event.params.commentId,
      },
      apns: { payload: { aps: { sound: 'default' } } },
      android: { priority: 'high' as const },
    };
    
    const resp = await fcm.sendEachForMulticast(message as any);
    console.log(`📢 공지사항 댓글 알림 전송: 성공 ${resp.successCount}, 실패 ${resp.failureCount}`);
    
    // 실패한 토큰 정리
    const failedTokens: string[] = [];
    resp.responses.forEach((r, idx) => {
      if (!r.success) failedTokens.push((message as any).tokens[idx]);
    });
    
    if (failedTokens.length) {
      try {
        const userRef = db.doc(`users/${targetUserId}`);
        const cur: string[] = (userData?.fcmTokens || []) as string[];
        const next = cur.filter((t) => !failedTokens.includes(t));
        if (next.length !== cur.length) await userRef.update({ fcmTokens: next });
      } catch (error) {
        console.error(`❌ 사용자 ${targetUserId} 토큰 업데이트 실패:`, error);
      }
    }
  } catch (error) {
    console.error('❌ 공지사항 댓글 알림 전송 실패:', error);
  }
});

// SKTaxi: 게시판 좋아요 시 알림 전송
export const onBoardLikeCreated = onDocumentCreated('userBoardInteractions/{interactionId}', async (event) => {
  const interactionData = event.data?.data();
  
  if (!interactionData) return;
  
  const { postId, userId, isLiked } = interactionData;
  
  // 좋아요가 아닌 경우 무시
  if (!isLiked) return;
  
  try {
    // 1. 게시글 정보 조회
    const postDoc = await db.doc(`boardPosts/${postId}`).get();
    const postData = postDoc.data();
    
    if (!postData) return;
    
    // 2. 본인 게시글에는 알림 전송하지 않음
    if (userId === postData.authorId) return;
    
    const targetUserId = postData.authorId;
    
    // 3. 사용자 알림 설정 확인
    const userDoc = await db.doc(`users/${targetUserId}`).get();
    const userData = userDoc.data();
    const notificationSettings = userData?.notificationSettings || {};
    
    // 게시판 좋아요 알림이 해제된 유저는 제외
    const boardLikeNotificationsEnabled = notificationSettings.boardLikeNotifications !== false;
    
    if (!boardLikeNotificationsEnabled) {
      console.log(`📢 ${targetUserId}의 게시판 좋아요 알림이 해제되어 있음`);
      return;
    }
    
    // 4. userNotification 생성
    await createUserNotification(targetUserId, {
      type: 'board_post_like',
      title: '누군가가 내 게시글에 좋아요를 눌렀어요',
      message: postData.title || '',
      data: { postId },
    });
    
    // 5. FCM 토큰 조회 및 Push 전송
    const tokens: string[] = (userData?.fcmTokens || []) as string[];
    
    if (tokens.length === 0) return;
    
    const message = {
      tokens,
      notification: {
        title: '누군가가 내 게시글에 좋아요를 눌렀어요',
        body: postData.title || '',
      },
      data: {
        type: 'board_post_like',
        postId,
      },
      apns: { payload: { aps: { sound: 'default' } } },
      android: { priority: 'high' as const },
    };
    
    const resp = await fcm.sendEachForMulticast(message as any);
    console.log(`📢 게시판 좋아요 알림 전송: 성공 ${resp.successCount}, 실패 ${resp.failureCount}`);
    
    // 실패한 토큰 정리
    const failedTokens: string[] = [];
    resp.responses.forEach((r, idx) => {
      if (!r.success) failedTokens.push((message as any).tokens[idx]);
    });
    
    if (failedTokens.length) {
      try {
        const userRef = db.doc(`users/${targetUserId}`);
        const cur: string[] = (userData?.fcmTokens || []) as string[];
        const next = cur.filter((t) => !failedTokens.includes(t));
        if (next.length !== cur.length) await userRef.update({ fcmTokens: next });
      } catch (error) {
        console.error(`❌ 사용자 ${targetUserId} 토큰 업데이트 실패:`, error);
      }
    }
  } catch (error) {
    console.error('❌ 게시판 좋아요 알림 전송 실패:', error);
  }
});