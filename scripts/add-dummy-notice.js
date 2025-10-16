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
      updatedAt: now
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
    console.log(`📅 작성 시간: ${now.toDate()}`);
    console.log(`📝 제목: ${dummyNotice.title}`);
    
    // SKTaxi: 1분 후 자동 삭제 (선택사항)
    console.log('⏰ 1분 후 자동 삭제됩니다...');
    setTimeout(async () => {
      try {
        await docRef.delete();
        console.log('🗑️ 더미 공지 삭제 완료!');
        process.exit(0);
      } catch (error) {
        console.error('❌ 삭제 실패:', error);
        process.exit(1);
      }
    }, 1000 * 60);
    
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
