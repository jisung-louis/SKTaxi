const { crawlNoticeContent } = require('./crawl');
const admin = require('firebase-admin');
const Parser = require('rss-parser');
const https = require('https');
const crypto = require('crypto');

// SKTaxi: Firebase 초기화
const serviceAccount = require('../firebase-cloud-functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sktaxi-acb4c-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

// SKTaxi: 공지사항 카테고리 매핑
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
};

const RSS_BASE_URL = 'https://www.sungkyul.ac.kr/bbs/skukr';

// SKTaxi: RSS 파서 설정 (SSL 인증서 문제 해결)
const parser = new Parser({
  requestOptions: {
    agent: new https.Agent({ rejectUnauthorized: false })
  }
});

// SKTaxi: 단일 카테고리 처리 함수
async function processSingleCategory(category, categoryId, rowCount = 2000) {
  try {
    console.log(`📂 ${category} 카테고리 처리 시작... (${rowCount}개)`);
    
    const rssUrl = `${RSS_BASE_URL}/${categoryId}/rssList.do?row=${rowCount}`;
    const feed = await parser.parseURL(rssUrl);
    
    console.log(`📊 ${category} RSS 파싱 완료: ${feed.items.length}개 아이템`);
    
    return feed.items.map((item, index) => {
      const fullLink = item.link?.startsWith('http') ? item.link : `https://www.sungkyul.ac.kr${item.link}`;

      // Ensure consistent fields
      const title = (item.title || '').trim();
      const content = (item.description || item.content || item.contentSnippet || '').toString().trim();
      const date = (item.pubDate || item.isoDate || '').toString().trim();
      const author = (item.author || '').trim();  
      // SKTaxi: 안정적인 문서 ID 생성 (링크 기반, 업로드/함수 동일)
      const stableId = Buffer.from(fullLink || `${categoryId}:${title}`)
        .toString('base64')
        .replace(/=+$/, '')
        .slice(0, 120);

      // SKTaxi: contentHash 생성 (변경 감지용, 업로드/함수 동일)
      const contentHash = crypto
        .createHash('sha1')
        .update(`${title}|${fullLink}|${date}`)
        .digest('hex');

      // SKTaxi: date 문자열을 Timestamp로 변환 (초기 업로드는 기존 방식 유지)
      let postedAt = admin.firestore.FieldValue.serverTimestamp();
      try {
        if (date) {
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            postedAt = admin.firestore.Timestamp.fromDate(parsedDate);
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
        postedAt,
        category,
        author: author,
        department: '성결대학교',
        source: 'RSS',
        contentHash,
      };
    });
  } catch (error) {
    console.error(`❌ ${category} RSS 처리 실패:`, error);
    return [];
  }
}

// SKTaxi: 모든 공지사항 업로드 함수
async function uploadAllNotices() {
  try {
    console.log('🚀 전체 공지사항 업로드 시작...');
    
    const allNotices = [];
    const categoryResults = {};
    
    // SKTaxi: 각 카테고리를 순차적으로 처리 (메모리 효율성)
    for (const [category, categoryId] of Object.entries(NOTICE_CATEGORIES)) {
      const notices = await processSingleCategory(category, categoryId, 2000);
      for (const notice of notices) {
        try {
          console.log(`🕷️ ${notice.title} 크롤링 중...`);
          const { contentHtml, attachments } = await crawlNoticeContent(notice.link);
          notice.contentDetail = contentHtml || '';
          notice.contentAttachments = attachments || [];
        } catch (e) {
          console.warn(`⚠️ ${notice.title} 크롤링 실패:`, e.message);
          notice.contentDetail = '';
          notice.contentAttachments = [];
        }
      }
      allNotices.push(...notices);
      categoryResults[category] = notices.length;
      console.log(`✅ ${category} 완료: ${notices.length}개`);
      
      // SKTaxi: 메모리 절약을 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`📊 전체 공지사항 수집 완료: ${allNotices.length}개`);
    console.log(`📊 카테고리별 결과:`, categoryResults);
    
    // SKTaxi: Firestore에 배치 업로드
    console.log('💾 Firestore 업로드 시작...');
    
    let batch = db.batch();
    let operationCount = 0;
    const COMMIT_THRESHOLD = 450; // Firestore 배치 제한
    
    for (const notice of allNotices) {
      const docRef = db.collection('notices').doc(notice.id);
      batch.set(docRef, {
        ...notice,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      operationCount++;
      
      // SKTaxi: 배치 제한에 도달하면 커밋하고 새 배치 생성
      if (operationCount >= COMMIT_THRESHOLD) {
        await batch.commit();
        console.log(`✅ 배치 커밋 완료: ${operationCount}개 작업`);
        batch = db.batch(); // SKTaxi: 새 배치 생성
        operationCount = 0;
      }
    }
    
    // SKTaxi: 남은 작업 커밋
    if (operationCount > 0) {
      await batch.commit();
      console.log(`✅ 최종 배치 커밋 완료: ${operationCount}개 작업`);
    }
    
    console.log('🎉 모든 공지사항 업로드 완료!');
    console.log(`📊 총 업로드된 공지사항: ${allNotices.length}개`);
    
    // SKTaxi: 카테고리별 통계 출력
    console.log('\n📊 카테고리별 업로드 결과:');
    Object.entries(categoryResults).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}개`);
    });
    
  } catch (error) {
    console.error('❌ 업로드 실패:', error);
    process.exit(1);
  }
}

// SKTaxi: 스크립트 실행
if (require.main === module) {
  uploadAllNotices()
    .then(() => {
      console.log('✅ 스크립트 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실패:', error);
      process.exit(1);
    });
}

module.exports = { uploadAllNotices, processSingleCategory };
