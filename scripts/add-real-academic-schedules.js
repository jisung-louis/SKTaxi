const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
const serviceAccount = require('../functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 실제 학사일정 데이터 (2025년 4월 ~ )
const realAcademicSchedules = [
  // 2025년 4월
  {
    title: '중간 강의평가 기간',
    startDate: '2025-04-01',
    endDate: '2025-04-11',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '2025학년도 1학기 교내 정규 2차(후지급) 장학금 신청',
    startDate: '2025-04-01',
    endDate: '2025-04-07',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '영성훈련(신학대학원)',
    startDate: '2025-04-21',
    endDate: '2025-04-22',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  
  // 2025년 5월
  {
    title: '근로자의날 (수업없음)',
    startDate: '2025-05-01',
    endDate: '2025-05-01',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '어린이날, 부처님오신날',
    startDate: '2025-05-05',
    endDate: '2025-05-05',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '대체휴일',
    startDate: '2025-05-06',
    endDate: '2025-05-06',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '전부(과), 재입학, 복수전공, 부전공, 융합전공(주전공, 복수전공, 부전공) 모듈형트랙제 신청기간',
    startDate: '2025-05-12',
    endDate: '2025-05-16',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '하계계절학기 예비수강 신청기간',
    startDate: '2025-05-12',
    endDate: '2025-05-14',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '조기졸업 신청기간',
    startDate: '2025-05-14',
    endDate: '2025-05-16',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '졸업유예 신청기간',
    startDate: '2025-05-26',
    endDate: '2025-05-30',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '2025학년도 2학기 교내 정규 1차(선감면) 장학금 신청',
    startDate: '2025-05-26',
    endDate: '2025-05-30',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '종강 채플(일반대, 신학대, 제자반)',
    startDate: '2025-05-28',
    endDate: '2025-05-29',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '1학기 수업일수 12/15선',
    startDate: '2025-05-29',
    endDate: '2025-05-29',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '후기졸업자 논문(시험·작품·연주·실기)제출 마감',
    startDate: '2025-05-30',
    endDate: '2025-05-30',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  
  // 2025년 6월
  {
    title: '21대 대통령선거일',
    startDate: '2025-06-03',
    endDate: '2025-06-03',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '현충일',
    startDate: '2025-06-06',
    endDate: '2025-06-06',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '강의평가기간',
    startDate: '2025-06-10',
    endDate: '2025-06-23',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '기말고사(수요일 수업 15주차 종강일)',
    startDate: '2025-06-11',
    endDate: '2025-06-11',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '신학대학원 종강 경건회',
    startDate: '2025-06-16',
    endDate: '2025-06-16',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '화요일 수업 14주차',
    startDate: '2025-06-17',
    endDate: '2025-06-17',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '기말고사',
    startDate: '2025-06-18',
    endDate: '2025-06-23',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '1학기 종강일',
    startDate: '2025-06-23',
    endDate: '2025-06-23',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '하계 계절학기 기간(15일)',
    startDate: '2025-06-24',
    endDate: '2025-07-14',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '하계방학',
    startDate: '2025-06-24',
    endDate: '2025-06-24',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '성적 및 출석부 제출마감',
    startDate: '2025-06-27',
    endDate: '2025-06-27',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '재학생 성적열람',
    startDate: '2025-06-30',
    endDate: '2025-06-30',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  
  // 2025년 7월
  {
    title: '재학생 성적정정 신청기간',
    startDate: '2025-07-01',
    endDate: '2025-07-03',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '계절학기 성적 및 출석부 제출',
    startDate: '2025-07-15',
    endDate: '2025-07-16',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '휴학·복학 신청기간',
    startDate: '2025-07-21',
    endDate: '2025-07-25',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '2024학년도 후기 졸업사정회',
    startDate: '2025-07-31',
    endDate: '2025-07-31',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  
  // 2025년 8월
  {
    title: '예비수강신청기간(장바구니)',
    startDate: '2025-08-11',
    endDate: '2025-08-13',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '후기 학기수여(학위수여식 없음)',
    startDate: '2025-08-14',
    endDate: '2025-08-14',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '수강신청기간',
    startDate: '2025-08-18',
    endDate: '2025-08-20',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '2025학년도 2학기 등록기간',
    startDate: '2025-08-22',
    endDate: '2025-08-29',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  
  // 2025년 9월
  {
    title: '수강신청 변경기간',
    startDate: '2025-09-01',
    endDate: '2025-09-05',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '이수구분변경 및 4학년 학점이수 확인기간',
    startDate: '2025-09-01',
    endDate: '2025-09-05',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '개강(정상수업)',
    startDate: '2025-09-01',
    endDate: '2025-09-01',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '신학대학원 개강 경건회',
    startDate: '2025-09-01',
    endDate: '2025-09-01',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '개강 채플(일반대학, 신학대학, 제자반)',
    startDate: '2025-09-10',
    endDate: '2025-09-11',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '영성훈련(신학대학)',
    startDate: '2025-09-11',
    endDate: '2025-09-11',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '수강과목 철회 신청기간',
    startDate: '2025-09-15',
    endDate: '2025-09-19',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '개교기념일 대체휴일',
    startDate: '2025-09-22',
    endDate: '2025-09-22',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '중간 강의평가 기간',
    startDate: '2025-09-30',
    endDate: '2025-10-17',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  
  // 2025년 10월
  {
    title: '개천절',
    startDate: '2025-10-03',
    endDate: '2025-10-03',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '추석연휴',
    startDate: '2025-10-06',
    endDate: '2025-10-08',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '한글날',
    startDate: '2025-10-09',
    endDate: '2025-10-09',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '2025학년도 2학기 교내 정규 2차(후지급) 장학금 신청',
    startDate: '2025-10-13',
    endDate: '2025-10-17',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '영성훈련(신학대학원)',
    startDate: '2025-10-20',
    endDate: '2025-10-21',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '조기졸업 신청기간',
    startDate: '2025-10-22',
    endDate: '2025-10-24',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '전부(과), 재입학, 복수전공, 부전공, 융합전공(주전공, 복수전공, 부전공) 모듈형트렉제 신청기간',
    startDate: '2025-10-27',
    endDate: '2025-10-31',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  
  // 2025년 11월
  {
    title: '동계계절학기 예비수강 신청기간',
    startDate: '2025-11-03',
    endDate: '2025-11-05',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '졸업유예 신청기간',
    startDate: '2025-11-24',
    endDate: '2025-11-26',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '2026학년도 1학기 교내 정규 1차(선감면) 장학금 신청',
    startDate: '2025-11-24',
    endDate: '2025-11-28',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '종강채플(일반대, 신학대, 제자반)',
    startDate: '2025-11-26',
    endDate: '2025-11-27',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  
  // 2025년 12월
  {
    title: '2학기 수업일수 12/15선',
    startDate: '2025-12-01',
    endDate: '2025-12-01',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '졸업논문(시험ㆍ작품ㆍ연주ㆍ실기) 제출마감',
    startDate: '2025-12-05',
    endDate: '2025-12-05',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '자율전공선택제(1,2유형) 학부(과) 전공선택 신청기간',
    startDate: '2025-12-08',
    endDate: '2025-12-12',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '강의평가기간',
    startDate: '2025-12-09',
    endDate: '2025-12-22',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '신학대학원 종강 경건회',
    startDate: '2025-12-15',
    endDate: '2025-12-15',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '기말고사',
    startDate: '2025-12-16',
    endDate: '2025-12-22',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '종강일',
    startDate: '2025-12-22',
    endDate: '2025-12-22',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '동계계절학기 기간(15일)',
    startDate: '2025-12-23',
    endDate: '2026-01-14',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '동계방학 시작',
    startDate: '2025-12-23',
    endDate: '2025-12-23',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '성적제출ㆍ출석부 제출마감',
    startDate: '2025-12-29',
    endDate: '2025-12-29',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '재학생 성적열람',
    startDate: '2025-12-30',
    endDate: '2025-12-30',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '재학생 성적정정 신청기간',
    startDate: '2025-12-31',
    endDate: '2026-01-02',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  
  // 2026년 1월
  {
    title: '계절학기 성적 및 출석부 제출',
    startDate: '2026-01-15',
    endDate: '2026-01-16',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '휴학 · 복학 신청기간',
    startDate: '2026-01-23',
    endDate: '2026-01-29',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '2025학년도 전기 졸업사정회',
    startDate: '2026-01-29',
    endDate: '2026-01-29',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  
  // 2026년 2월
  {
    title: '예비 수강신청 기간(장바구니)',
    startDate: '2026-02-02',
    endDate: '2026-02-04',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '수강신청기간',
    startDate: '2026-02-09',
    endDate: '2026-02-11',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '2025학년도 전기 학위수여식',
    startDate: '2026-02-12',
    endDate: '2026-02-12',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '2026학년도 1학기 등록기간',
    startDate: '2026-02-20',
    endDate: '2026-02-27',
    type: 'multi',
    description: null,
    isPrimary: true,
  }
];

async function addRealAcademicSchedules() {
  try {
    console.log('🚀 실제 학사일정 데이터 추가 시작...');
    
    // 새 데이터 추가
    console.log('📅 새로운 학사일정 데이터 추가 중...');
    const batch = db.batch();
    
    realAcademicSchedules.forEach((schedule, index) => {
      const docRef = db.collection('academicSchedules').doc();
      batch.set(docRef, {
        ...schedule,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    
    await batch.commit();
    
    console.log('✅ 실제 학사일정 데이터 추가 완료!');
    console.log(`📊 총 ${realAcademicSchedules.length}개의 일정이 추가되었습니다.`);
    
    // 추가된 데이터 확인
    const addedSchedules = await db.collection('academicSchedules').get();
    console.log('📋 추가된 일정 목록:');
    addedSchedules.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.title} (${data.startDate} ~ ${data.endDate}) - ${data.isPrimary ? '중요' : '일반'}`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    process.exit(0);
  }
}

// 스크립트 실행
addRealAcademicSchedules();
