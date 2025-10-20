const admin = require('firebase-admin');

// SKTaxi: Firebase 초기화
const serviceAccount = require('../functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sktaxi-acb4c-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

// SKTaxi: 더미 공지 생성
async function addDummyNotice() {
  try {
    console.log('🚀 더미 공지 추가 시작...');
    
    const now = admin.firestore.Timestamp.now();
    const dummyNotice = {
      title: `[테스트] 더미 공지사항 - ${now.toDate().toLocaleString('ko-KR')}`,
      content: '이것은 실시간 업데이트 테스트를 위한 더미 공지사항입니다. 앱에서 실시간으로 나타나는지 확인해보세요!',
      link: 'https://www.sungkyul.ac.kr',
      postedAt: now,
      category: '새소식',
      author: '성결대학교',
      guid: `dummy_${Date.now()}`,
      source: 'TEST',
      contentHash: `dummy_hash_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      // SKTaxi: push 알림 테스트를 위한 필드 추가
      likeCount: 0,
      commentCount: 0
    };
    
    // SKTaxi: 안정적인 문서 ID 생성 (링크 기반)
    const stableId = Buffer.from(`dummy_${now.toMillis()}`)
      .toString('base64')
      .replace(/=+$/, '')
      .slice(0, 120);
    
    const docRef = db.collection('notices').doc(stableId);
    await docRef.set(dummyNotice);
    
    console.log('✅ 더미 공지 추가 완료!');
    console.log(`📄 문서 ID: ${stableId}`);
    console.log(`📅 작성 시간: ${now.toDate().toLocaleString('ko-KR')}`);
    console.log(`📝 제목: ${dummyNotice.title}`);
    console.log('');
    console.log('🔔 Push 알림 테스트 안내:');
    console.log('1. 앱에서 알림 설정이 켜져 있는지 확인하세요');
    console.log('2. 앱이 백그라운드에 있거나 종료된 상태에서 테스트하세요');
    console.log('3. Firebase Functions가 배포되어 있어야 합니다');
    console.log('4. 10초 후 자동으로 삭제됩니다');
    
    // SKTaxi: 10초 후 자동 삭제 (선택사항)
    console.log('⏰ 10초 후 자동 삭제됩니다...');
    setTimeout(async () => {
      try {
        await docRef.delete();
        console.log('🗑️ 더미 공지 삭제 완료!');
        process.exit(0);
      } catch (error) {
        console.error('❌ 삭제 실패:', error);
        process.exit(1);
      }
    }, 1000 * 10);
    
  } catch (error) {
    console.error('❌ 더미 공지 추가 실패:', error);
    process.exit(1);
  }
}

// SKTaxi: 스크립트 실행
if (require.main === module) {
  addDummyNotice();
}

module.exports = { addDummyNotice };
