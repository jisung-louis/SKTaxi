const admin = require('firebase-admin');
const serviceAccount = require('../functions/serviceAccountKey.json');

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sktaxi-7b8b4-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

const addTestCafeteriaMenu = async () => {
  console.log('테스트 학식 메뉴 추가 시작...');

  // 2025년 10월 4주차 (2025.10.20 월 ~ 2025.10.24 금)
  const currentWeek = 43; // 10월 4주차
  const year = 2025;
  const weekId = `${year}-W${currentWeek}`;

  const testMenu = {
    id: weekId,
    weekStart: '2025-10-20',
    weekEnd: '2025-10-24',
    rollNoodles: [
      '짜장면 (4,500원)',
      '짬뽕 (5,000원)',
      '볶음밥 (4,000원)',
      '탕수육 (6,000원)',
      '짜장밥 (4,500원)',
      '짬뽕밥 (5,000원)',
      '짜장면 (4,500원)',
      '짬뽕 (5,000원)',
      '볶음밥 (4,000원)',
      '탕수육 (6,000원)'
    ],
    theBab: [
      '김치찌개 (4,500원)',
      '된장찌개 (4,000원)',
      '순두부찌개 (4,500원)',
      '부대찌개 (5,000원)',
      '김치찌개 (4,500원)',
      '된장찌개 (4,000원)',
      '순두부찌개 (4,500원)'
    ],
    fryRice: [
      '치킨가라아게 (5,500원)',
      '돈까스 (5,000원)',
      '치킨가라아게 (5,500원)',
      '돈까스 (5,000원)',
      '치킨가라아게 (5,500원)',
      '돈까스 (5,000원)',
      '치킨가라아게 (5,500원)',
      '돈까스 (5,000원)',
      '치킨가라아게 (5,500원)',
      '돈까스 (5,000원)',
      '치킨가라아게 (5,500원)',
      '돈까스 (5,000원)',
      '치킨가라아게 (5,500원)',
      '돈까스 (5,000원)',
      '치킨가라아게 (5,500원)',
      '돈까스 (5,000원)'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection('cafeteriaMenus').doc(weekId).set(testMenu);
    console.log(`✅ 학식 메뉴 추가 완료: ${weekId}`);
    console.log(`📅 기간: ${testMenu.weekStart} ~ ${testMenu.weekEnd}`);
    console.log(`🍜 Roll & Noodles: ${testMenu.rollNoodles.length}개`);
    console.log(`🍚 The bab: ${testMenu.theBab.length}개`);
    console.log(`🍛 Fry & Rice: ${testMenu.fryRice.length}개`);
    console.log('🎉 테스트 학식 메뉴가 성공적으로 추가되었습니다!');
  } catch (error) {
    console.error('❌ 학식 메뉴 추가 실패:', error);
  }
};

addTestCafeteriaMenu().catch(console.error);
