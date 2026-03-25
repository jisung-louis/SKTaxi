const admin = require('firebase-admin');
const serviceAccount = require('../firebase-cloud-functions/serviceAccountKey.json');

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

// 주간 날짜 배열 생성 (월~금)
const getWeekDates = (weekStart) => {
  const dates = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 5; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
};

// 배열을 날짜별 객체로 변환 (모든 날짜에 동일한 메뉴)
const convertToDailyMenu = (items, weekDates) => {
  const dailyMenu = {};
  weekDates.forEach(date => {
    dailyMenu[date] = items;
  });
  return dailyMenu;
};

// 2025.12.08 ~ 2025.12.12 주차 학식 메뉴 데이터 (50주차)
// 테스트용: 요일마다 다른 메뉴 (날짜별 객체 형태)
const weekDates = ['2025-12-08', '2025-12-09', '2025-12-10', '2025-12-11', '2025-12-12'];

const menuData = {
  // Roll & Noodles (요일마다 다른 메뉴)
  rollNoodles: {
    '2025-12-08': removeDuplicates([
      '계란라면(신)',
      '치즈추가',
      '유부우동',
      '김치우동',
      '꼬치어묵우동',
      '왕새우튀김우동',
      '우동돈까스세트'
    ]),
    '2025-12-09': removeDuplicates([
      '계란라면(신)',
      '치즈추가',
      '유부우동',
      '로제카레우동',
      '왕새우튀김로제카레우동',
      '우삼겹된장찌개',
      '들기름메밀국수'
    ]),
    '2025-12-10': removeDuplicates([
      '계란라면(신)',
      '치즈추가',
      '김치우동',
      '꼬치어묵우동',
      '왕새우튀김우동',
      '우동돈까스세트',
      '로제카레우동'
    ]),
    '2025-12-11': removeDuplicates([
      '계란라면(신)',
      '치즈추가',
      '유부우동',
      '왕새우튀김로제카레우동',
      '우삼겹된장찌개',
      '들기름메밀국수돈까스세트'
    ]),
    '2025-12-12': removeDuplicates([
      '계란라면(신)',
      '치즈추가',
      '유부우동',
      '김치우동',
      '꼬치어묵우동',
      '왕새우튀김우동',
      '우동돈까스세트',
      '로제카레우동',
      '왕새우튀김로제카레우동'
    ])
  },

  // The bab (요일마다 다른 메뉴)
  theBab: {
    '2025-12-08': removeDuplicates([
      '참치마요비빔밥ⓣ',
      '마그마참치마요비빔밥ⓣ',
      '치킨마요비빔밥ⓣ',
      '제육덮밥ⓣ',
      '목살고추장비빔밥ⓣ'
    ]),
    '2025-12-09': removeDuplicates([
      '참치마요비빔밥ⓣ',
      '치킨마요비빔밥ⓣ',
      '마그마치킨마요비빔밥ⓣ',
      '제육덮밥ⓣ',
      '갈비양념구이덮밥ⓣ',
      '새싹육회비빔밥'
    ]),
    '2025-12-10': removeDuplicates([
      '참치마요비빔밥ⓣ',
      '마그마참치마요비빔밥ⓣ',
      '치킨마요비빔밥ⓣ',
      '마그마치킨마요비빔밥ⓣ',
      '제육덮밥ⓣ',
      '목살고추장비빔밥ⓣ',
      '갈비양념구이덮밥ⓣ'
    ]),
    '2025-12-11': removeDuplicates([
      '참치마요비빔밥ⓣ',
      '치킨마요비빔밥ⓣ',
      '제육덮밥ⓣ',
      '갈비양념구이덮밥ⓣ',
      '새싹육회비빔밥'
    ]),
    '2025-12-12': removeDuplicates([
      '참치마요비빔밥ⓣ',
      '마그마참치마요비빔밥ⓣ',
      '치킨마요비빔밥ⓣ',
      '마그마치킨마요비빔밥ⓣ',
      '제육덮밥ⓣ',
      '목살고추장비빔밥ⓣ',
      '갈비양념구이덮밥ⓣ'
    ])
  },

  // Fry & Rice (요일마다 다른 메뉴)
  fryRice: {
    '2025-12-08': removeDuplicates([
      '로제크림카레ⓣ',
      '케네디소시지로제크림카레ⓣ',
      '왕새우튀김로제크림카레ⓣ',
      '돈까스로제크림카레ⓣ',
      '치즈고구마돈까스',
      '왕돈까스',
      '오므라이스ⓣ'
    ]),
    '2025-12-09': removeDuplicates([
      '로제크림카레ⓣ',
      '고추가라아게로제크림카레ⓣ',
      '치즈고구마돈까스',
      '왕돈까스',
      '케네디소시지ⓣ',
      '닭강정ⓣ',
      '소떡소떡ⓣ',
      '돈까스오므라이스ⓣ'
    ]),
    '2025-12-10': removeDuplicates([
      '로제크림카레ⓣ',
      '케네디소시지로제크림카레ⓣ',
      '왕새우튀김로제크림카레ⓣ',
      '돈까스로제크림카레ⓣ',
      '고추가라아게로제크림카레ⓣ',
      '치즈고구마돈까스',
      '왕돈까스',
      '케네디소시지ⓣ',
      '닭강정ⓣ',
      '오므라이스ⓣ'
    ]),
    '2025-12-11': removeDuplicates([
      '로제크림카레ⓣ',
      '왕새우튀김로제크림카레ⓣ',
      '치즈고구마돈까스',
      '왕돈까스',
      '닭강정ⓣ',
      '소떡소떡ⓣ',
      '닭강정오므라이스ⓣ',
      '케네디소시지오므라이스ⓣ'
    ]),
    '2025-12-12': removeDuplicates([
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
      '바베큐폭찹오므라이스ⓣ'
    ])
  }
};

const addCafeteriaMenu = async () => {
  console.log('학식 메뉴 추가 시작...');

  try {
    // 2025년 12월 8일(월) 기준으로 ISO 주차 계산 (50주차)
    const weekStartDate = new Date('2025-12-08');
    const weekNumber = getISOWeek(weekStartDate);
    const year = weekStartDate.getFullYear();
    const weekId = `${year}-W${weekNumber}`;
    
    // 학식은 월~금에만 제공되므로 weekEnd는 금요일로 설정
    const weekStart = '2025-12-08'; // 월요일
    const weekEnd = '2025-12-12';   // 금요일
    
    // 메뉴 데이터를 날짜별 객체 형태로 변환
    const convertMenu = (menuItems) => {
      // 이미 날짜별 객체인 경우
      if (typeof menuItems === 'object' && !Array.isArray(menuItems)) {
        return menuItems;
      }
      // 배열인 경우 - 모든 날짜에 동일한 메뉴로 변환
      // (모든 요일 동일한 메뉴를 저장할 때 사용)
      return convertToDailyMenu(menuItems, weekDates);
    };

    const cafeteriaMenu = {
      id: weekId,
      weekStart: weekStart,
      weekEnd: weekEnd,
      rollNoodles: convertMenu(menuData.rollNoodles),
      theBab: convertMenu(menuData.theBab),
      fryRice: convertMenu(menuData.fryRice),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Firestore에 저장
    await db.collection('cafeteriaMenus').doc(weekId).set(cafeteriaMenu);
    
    console.log(`✅ 학식 메뉴 추가 완료: ${weekId}`);
    console.log(`📅 기간: ${weekStart} ~ ${weekEnd} (월~금)`);
    console.log(`📝 저장 형식: 날짜별 객체 (요일마다 다른 메뉴)`);
    
    // 메뉴 통계 출력 (날짜별)
    console.log('\n📊 요일별 메뉴 개수:');
    weekDates.forEach(date => {
      const dayName = ['월', '화', '수', '목', '금'][weekDates.indexOf(date)];
      const rollCount = menuData.rollNoodles[date]?.length || 0;
      const theBabCount = menuData.theBab[date]?.length || 0;
      const fryCount = menuData.fryRice[date]?.length || 0;
      console.log(`  ${date} (${dayName}): Roll & Noodles ${rollCount}개, The bab ${theBabCount}개, Fry & Rice ${fryCount}개`);
    });
    
    // 메뉴 상세 출력 (요일별)
    console.log('\n📋 요일별 메뉴 상세:');
    weekDates.forEach(date => {
      const dayName = ['월', '화', '수', '목', '금'][weekDates.indexOf(date)];
      console.log(`\n📅 ${date} (${dayName}요일)`);
      
      console.log('\n🍜 Roll & Noodles:');
      menuData.rollNoodles[date].forEach((item, index) => {
        console.log(`  ${index + 1}. ${item}`);
      });
      
      console.log('\n🍚 The bab:');
      menuData.theBab[date].forEach((item, index) => {
        console.log(`  ${index + 1}. ${item}`);
      });
      
      console.log('\n🍛 Fry & Rice:');
      menuData.fryRice[date].forEach((item, index) => {
        console.log(`  ${index + 1}. ${item}`);
      });
    });
    
    console.log('\n🎉 학식 메뉴가 성공적으로 추가되었습니다!');
    
  } catch (error) {
    console.error('❌ 학식 메뉴 추가 실패:', error);
    process.exit(1);
  }
};

addCafeteriaMenu().catch(console.error);
