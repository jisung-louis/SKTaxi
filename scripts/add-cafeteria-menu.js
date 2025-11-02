const admin = require('firebase-admin');
const serviceAccount = require('../functions/serviceAccountKey.json');

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sktaxi-7b8b4-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

// ISO 주차 계산 함수
const getISOWeek = (date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};

// 중복 제거 유틸리티 함수
const removeDuplicates = (arr) => {
  return [...new Set(arr)];
};

// 2025.11.03 ~ 2025.11.09 주차 학식 메뉴 데이터 (45주차)
const menuData = {
  // Roll & Noodles (10개, 모든 요일 동일)
  rollNoodles: removeDuplicates([
    '계란라면(신)',
    '치즈추가',
    '유부우동',
    '김치우동',
    '꼬치어묵우동',
    '왕새우튀김우동',
    '우동돈까스세트',
    '로제카레우동',
    '왕새우튀김로제카레우동',
    '돈육순두부찌개'
  ]),

  // The bab (8개, 모든 요일 동일)
  theBab: removeDuplicates([
    '참치마요비빔밥ⓣ',
    '마그마참치마요비빔밥ⓣ',
    '치킨마요비빔밥ⓣ',
    '마그마치킨마요비빔밥ⓣ',
    '제육덮밥ⓣ',
    '목살고추장비빔밥ⓣ',
    '중식볶음밥ⓣ',
    '탕수육볶음밥'
  ]),

  // Fry & Rice (16개, 모든 요일 동일)
  fryRice: removeDuplicates([
    '로제크림카레ⓣ',
    '케네디소시지로제크림카레ⓣ',
    '왕새우튀김로제크림카레ⓣ',
    '돈까스로제크림카레ⓣ',
    '고추가라아게로제크림카레ⓣ',
    '치즈고구마돈까스',
    '왕돈까스',
    '케네디소시지ⓣ',
    '닭강정ⓣ',
    '소떡소떡ⓣ',
    '오므라이스ⓣ',
    '돈까스오므라이스ⓣ',
    '닭강정오므라이스ⓣ',
    '케네디소시지오므라이스ⓣ',
    '김치가츠동ⓣ',
    '김치치즈가츠동ⓣ'
  ])
};

const addCafeteriaMenu = async () => {
  console.log('학식 메뉴 추가 시작...');

  try {
    // 2025년 11월 3일(월) 기준으로 ISO 주차 계산
    const weekStartDate = new Date('2025-11-03');
    const weekNumber = getISOWeek(weekStartDate);
    const year = weekStartDate.getFullYear();
    const weekId = `${year}-W${weekNumber}`;
    
    // 학식은 월~금에만 제공되므로 weekEnd는 금요일로 설정
    const weekStart = '2025-11-03'; // 월요일
    const weekEnd = '2025-11-07';   // 금요일

    const cafeteriaMenu = {
      id: weekId,
      weekStart: weekStart,
      weekEnd: weekEnd,
      rollNoodles: menuData.rollNoodles,
      theBab: menuData.theBab,
      fryRice: menuData.fryRice,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Firestore에 저장
    await db.collection('cafeteriaMenus').doc(weekId).set(cafeteriaMenu);
    
    console.log(`✅ 학식 메뉴 추가 완료: ${weekId}`);
    console.log(`📅 기간: ${weekStart} ~ ${weekEnd} (월~금)`);
    console.log(`🍜 Roll & Noodles: ${menuData.rollNoodles.length}개`);
    console.log(`🍚 The bab: ${menuData.theBab.length}개`);
    console.log(`🍛 Fry & Rice: ${menuData.fryRice.length}개`);
    
    // 메뉴 상세 출력
    console.log('\n📋 메뉴 상세:');
    console.log('\n🍜 Roll & Noodles:');
    menuData.rollNoodles.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item}`);
    });
    
    console.log('\n🍚 The bab:');
    menuData.theBab.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item}`);
    });
    
    console.log('\n🍛 Fry & Rice:');
    menuData.fryRice.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item}`);
    });
    
    console.log('\n🎉 학식 메뉴가 성공적으로 추가되었습니다!');
    
  } catch (error) {
    console.error('❌ 학식 메뉴 추가 실패:', error);
    process.exit(1);
  }
};

addCafeteriaMenu().catch(console.error);
