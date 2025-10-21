const admin = require('firebase-admin');
const serviceAccount = require('../functions/serviceAccountKey.json');

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sktaxi-7b8b4-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

// HTML 테이블 데이터를 파싱하는 함수
const parseCafeteriaData = () => {
  // 제공된 HTML 데이터에서 메뉴 정보 추출
  const rollNoodlesMenu = [
    '계란라면(신)',
    '치즈추가',
    '유부우동',
    '김치우동',
    '꼬치어묵우동',
    '새우튀김우동',
    '우동치킨치즈세트',
    '비빔칼국수',
    '비빔칼국수치킨치즈세트',
    '우삼겹된장찌개'
  ];

  const theBabMenu = [
    '치킨마요비빔밥ⓣ',
    '마그마치킨마요비빔밥ⓣ',
    '새우튀김알밥ⓣ',
    '마그마새우튀김알밥ⓣ',
    '제육덮밥ⓣ',
    '목살고추장비빔밥ⓣ',
    '중화비빔밥ⓣ'
  ];

  const fryRiceMenu = [
    '카레덮밥ⓣ',
    '떡갈비카레동ⓣ',
    '치킨치즈카레동ⓣ',
    '고추치킨카레동ⓣ',
    '케네디소시지카레동ⓣ',
    '치즈고구마돈까스',
    '왕돈까스',
    '케네디소시지ⓣ',
    '닭강정ⓣ',
    '소떡소떡ⓣ',
    '오므라이스ⓣ',
    '떡갈비오므라이스ⓣ',
    '치킨치즈오므라이스ⓣ',
    '닭강정오므라이스ⓣ',
    '케네디소시지오므라이스ⓣ',
    '마라볶음밥ⓣ'
  ];

  return {
    rollNoodles: rollNoodlesMenu,
    theBab: theBabMenu,
    fryRice: fryRiceMenu
  };
};

const addCafeteriaMenuFromHTML = async () => {
  console.log('HTML 데이터에서 학식 메뉴 파싱 및 추가 시작...');

  try {
    // HTML 데이터 파싱
    const menuData = parseCafeteriaData();
    
    // 2025년 10월 4주차 데이터 생성
    const weekId = '2025-W43';
    const weekStart = '2025-10-20';
    const weekEnd = '2025-10-24';

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
    console.log(`📅 기간: ${weekStart} ~ ${weekEnd}`);
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
    
    console.log('\n🎉 HTML 데이터에서 학식 메뉴가 성공적으로 파싱되고 추가되었습니다!');
    
  } catch (error) {
    console.error('❌ 학식 메뉴 추가 실패:', error);
  }
};

addCafeteriaMenuFromHTML().catch(console.error);
