const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
const serviceAccount = require('../functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2026학년도 학사일정 데이터 (2026년 3월 ~ 2027년 2월)
const academicSchedules2026 = [
  // ========== 2026년 3월 ==========
  {
    title: '입학식 / 개강',
    startDate: '2026-03-03',
    endDate: '2026-03-03',
    type: 'single',
    description: '정상수업',
    isPrimary: true,
  },
  {
    title: '신편입생 수강신청기간',
    startDate: '2026-03-03',
    endDate: '2026-03-09',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '이수구분변경 및 4학년 학점이수 확인기간',
    startDate: '2026-03-03',
    endDate: '2026-03-09',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '수강신청 변경기간',
    startDate: '2026-03-04',
    endDate: '2026-03-09',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '신학대학원 개강 경건회',
    startDate: '2026-03-09',
    endDate: '2026-03-09',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '개강 채플',
    startDate: '2026-03-11',
    endDate: '2026-03-12',
    type: 'multi',
    description: '일반대학 / 신학대학 / 제자반',
    isPrimary: false,
  },
  {
    title: '수강과목 철회 신청기간',
    startDate: '2026-03-17',
    endDate: '2026-03-23',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '졸업논문(시험•작품•연주•실기)제목 제출마감',
    startDate: '2026-03-31',
    endDate: '2026-03-31',
    type: 'single',
    description: null,
    isPrimary: false,
  },

  // ========== 2026년 4월 ==========
  {
    title: '중간 강의평가 기간',
    startDate: '2026-04-01',
    endDate: '2026-04-10',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '교내 정규 2차 장학금 신청',
    startDate: '2026-04-01',
    endDate: '2026-04-07',
    type: 'multi',
    description: '2026학년도 1학기 교내 정규 2차(후지급) 장학금 신청',
    isPrimary: false,
  },
  {
    title: '영성훈련',
    startDate: '2026-04-20',
    endDate: '2026-04-21',
    type: 'multi',
    description: '신학대학원',
    isPrimary: false,
  },

  // ========== 2026년 5월 ==========
  {
    title: '노동절',
    startDate: '2026-05-01',
    endDate: '2026-05-01',
    type: 'single',
    description: '수업 없음',
    isPrimary: false,
  },
  {
    title: '전과 / 재입학 / 복수전공 / 부전공 / 모듈형트랙제 / 마이크로전공 신청기간',
    startDate: '2026-05-11',
    endDate: '2026-05-15',
    type: 'multi',
    description: '전부(과), 재입학, 복수전공, 부전공, 모듈형트랙제, 마이크로전공 신청기간',
    isPrimary: false,
  },
  {
    title: '조기졸업 신청기간',
    startDate: '2026-05-13',
    endDate: '2026-05-15',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '하계계절학기 예비수강 신청기간',
    startDate: '2026-05-18',
    endDate: '2026-05-20',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '교내 정규 1차 장학금 신청',
    startDate: '2026-05-26',
    endDate: '2026-06-01',
    type: 'multi',
    description: '2026학년도 2학기 교내 정규 1차(선감면) 장학금 신청',
    isPrimary: false,
  },
  {
    title: '종강 채플',
    startDate: '2026-05-27',
    endDate: '2026-05-28',
    type: 'multi',
    description: '일반대학 / 신학대학 / 제자반',
    isPrimary: false,
  },
  {
    title: '1학기 수업일수 12/15선',
    startDate: '2026-05-28',
    endDate: '2026-05-28',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '후기졸업자 논문제출 마감',
    startDate: '2026-05-29',
    endDate: '2026-05-29',
    type: 'single',
    description: '시험 / 작품 / 연주 / 실기',
    isPrimary: true,
  },

  // ========== 2026년 6월 ==========
  {
    title: '졸업유예 신청기간',
    startDate: '2026-06-08',
    endDate: '2026-06-10',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '자율전공학부 전공선택 신청기간',
    startDate: '2026-06-08',
    endDate: '2026-06-12',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '강의평가기간',
    startDate: '2026-06-08',
    endDate: '2026-06-19',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '기말고사',
    startDate: '2026-06-11',
    endDate: '2026-06-11',
    type: 'single',
    description: '목요일 수업 15주차 종강일',
    isPrimary: true,
  },
  {
    title: '신학대학원 종강 경건회',
    startDate: '2026-06-15',
    endDate: '2026-06-15',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '기말고사',
    startDate: '2026-06-16',
    endDate: '2026-06-19',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '하계 계절학기 기간',
    startDate: '2026-06-22',
    endDate: '2026-07-10',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '하계방학 시작',
    startDate: '2026-06-22',
    endDate: '2026-06-22',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '영성훈련',
    startDate: '2026-06-23',
    endDate: '2026-06-23',
    type: 'single',
    description: '신학대학',
    isPrimary: false,
  },
  {
    title: '성적 및 출석부 제출마감',
    startDate: '2026-06-30',
    endDate: '2026-06-30',
    type: 'single',
    description: null,
    isPrimary: true,
  },

  // ========== 2026년 7월 ==========
  {
    title: '재학생 성적열람',
    startDate: '2026-07-01',
    endDate: '2026-07-01',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '재학생 성적정정 신청시간',
    startDate: '2026-07-02',
    endDate: '2026-07-03',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '계절학기 성적 및 출석부 제출',
    startDate: '2026-07-13',
    endDate: '2026-07-14',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '휴학·복학 신청기간',
    startDate: '2026-07-20',
    endDate: '2026-07-24',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '2025학년도 후기 졸업사정회',
    startDate: '2026-07-30',
    endDate: '2026-07-30',
    type: 'single',
    description: null,
    isPrimary: true,
  },

  // ========== 2026년 8월 ==========
  {
    title: '예비수강신청기간',
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    type: 'multi',
    description: '장바구니 수강신청기간',
    isPrimary: true,
  },
  {
    title: '후기 학기수여',
    startDate: '2026-08-13',
    endDate: '2026-08-13',
    type: 'single',
    description: '학위수여식 없음',
    isPrimary: true,
  },
  {
    title: '수강신청기간',
    startDate: '2026-08-18',
    endDate: '2026-08-20',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '2026학년도 2학기 등록기간',
    startDate: '2026-08-21',
    endDate: '2026-08-28',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '영성훈련',
    startDate: '2026-08-25',
    endDate: '2026-08-25',
    type: 'single',
    description: '신학대학',
    isPrimary: false,
  },
  {
    title: '수강신청 변경기간',
    startDate: '2026-08-31',
    endDate: '2026-09-04',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '이수구분변경 및 4학년 학점이수 확인기간',
    startDate: '2026-08-31',
    endDate: '2026-09-04',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '개강',
    startDate: '2026-08-31',
    endDate: '2026-08-31',
    type: 'single',
    description: '정상수업',
    isPrimary: true,
  },
  {
    title: '신학대학원 개강 경건회',
    startDate: '2026-08-31',
    endDate: '2026-08-31',
    type: 'single',
    description: null,
    isPrimary: false,
  },

  // ========== 2026년 9월 ==========
  {
    title: '개강 채플',
    startDate: '2026-09-09',
    endDate: '2026-09-10',
    type: 'multi',
    description: '일반대학 / 신학대학 / 제자반',
    isPrimary: false,
  },
  {
    title: '수강과목 철회 신청기간',
    startDate: '2026-09-14',
    endDate: '2026-09-18',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '개교기념일 대체휴일',
    startDate: '2026-09-23',
    endDate: '2026-09-23',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '추석연휴',
    startDate: '2026-09-24',
    endDate: '2026-09-25',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '졸업논문 제목 제출마감',
    startDate: '2026-09-30',
    endDate: '2026-09-30',
    type: 'single',
    description: '시험 / 작품 / 연주 / 실기',
    isPrimary: false,
  },

  // ========== 2026년 10월 ==========
  {
    title: '교내 정규 2차 장학금 신청',
    startDate: '2026-10-01',
    endDate: '2026-10-08',
    type: 'multi',
    description: '2026학년도 2학기 교내 정규 2차(후지급) 장학금 신청',
    isPrimary: false,
  },
  {
    title: '개천절 대체휴일',
    startDate: '2026-10-05',
    endDate: '2026-10-05',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '중간 강의평가 기간',
    startDate: '2026-10-06',
    endDate: '2026-10-16',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '한글날',
    startDate: '2026-10-09',
    endDate: '2026-10-09',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '영성훈련',
    startDate: '2026-10-19',
    endDate: '2026-10-20',
    type: 'multi',
    description: '신학대학원',
    isPrimary: false,
  },
  {
    title: '조기졸업 신청기간',
    startDate: '2026-10-21',
    endDate: '2026-10-23',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '전과 / 재입학 / 복수전공 / 부전공 / 모듈형트랙제 / 마이크로전공 신청기간',
    startDate: '2026-10-26',
    endDate: '2026-10-30',
    type: 'multi',
    description: '전부(과), 재입학, 복수전공, 부전공, 모듈형트랙제, 마이크로전공 신청기간',
    isPrimary: true,
  },

  // ========== 2026년 11월 ==========
  {
    title: '동계계절학기 예비수강 신청기간',
    startDate: '2026-11-02',
    endDate: '2026-11-04',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '교내 정규 1차 장학금 신청',
    startDate: '2026-11-23',
    endDate: '2026-11-27',
    type: 'multi',
    description: '2027학년도 1학기 교내 정규 1차(선감면) 장학금 신청',
    isPrimary: false,
  },
  {
    title: '종강 채플',
    startDate: '2026-11-25',
    endDate: '2026-11-26',
    type: 'multi',
    description: '일반대학 / 신학대학 / 제자반',
    isPrimary: false,
  },
  {
    title: '2학기 수업일수 12/15선',
    startDate: '2026-11-27',
    endDate: '2026-11-27',
    type: 'single',
    description: null,
    isPrimary: false,
  },

  // ========== 2026년 12월 ==========
  {
    title: '졸업유예 신청기간',
    startDate: '2026-12-02',
    endDate: '2026-12-04',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '졸업논문 제출마감',
    startDate: '2026-12-04',
    endDate: '2026-12-04',
    type: 'single',
    description: '시험 / 작품 / 연주 / 실기',
    isPrimary: true,
  },
  {
    title: '신학대학원 종강 경건회',
    startDate: '2026-12-07',
    endDate: '2026-12-07',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '강의평가기간',
    startDate: '2026-12-07',
    endDate: '2026-12-18',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '자율전공학부 전공선택 신청기간',
    startDate: '2026-12-07',
    endDate: '2026-12-11',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '기말고사',
    startDate: '2026-12-08',
    endDate: '2026-12-08',
    type: 'single',
    description: '화요일 수업 15주차 종강일',
    isPrimary: true,
  },
  {
    title: '기말고사',
    startDate: '2026-12-14',
    endDate: '2026-12-18',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '동계계절학기 기간',
    startDate: '2026-12-21',
    endDate: '2027-01-12',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '동계방학 시작',
    startDate: '2026-12-21',
    endDate: '2026-12-21',
    type: 'single',
    description: null,
    isPrimary: false,
  },
  {
    title: '성적제출, 출석부 제출마감',
    startDate: '2026-12-24',
    endDate: '2026-12-24',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '재학생 성적열람',
    startDate: '2026-12-28',
    endDate: '2026-12-28',
    type: 'single',
    description: null,
    isPrimary: true,
  },
  {
    title: '재학생 성적정정 신청기간',
    startDate: '2026-12-29',
    endDate: '2026-12-31',
    type: 'multi',
    description: null,
    isPrimary: true,
  },

  // ========== 2027년 1월 ==========
  {
    title: '계절학기 성적 및 출석부 제출',
    startDate: '2027-01-13',
    endDate: '2027-01-14',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '휴학, 복학 신청기간',
    startDate: '2027-01-25',
    endDate: '2027-01-29',
    type: 'multi',
    description: null,
    isPrimary: false,
  },
  {
    title: '2026학년도 전기 졸업사정회',
    startDate: '2027-01-28',
    endDate: '2027-01-28',
    type: 'single',
    description: null,
    isPrimary: true,
  },

  // ========== 2027년 2월 ==========
  {
    title: '예비 수강신청 기간',
    startDate: '2027-02-01',
    endDate: '2027-02-03',
    type: 'multi',
    description: '장바구니 수강신청기간',
    isPrimary: true,
  },
  {
    title: '수강신청기간',
    startDate: '2027-02-15',
    endDate: '2027-02-17',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
  {
    title: '졸업식',
    startDate: '2027-02-18',
    endDate: '2027-02-18',
    type: 'single',
    description: '2026학년도 전기 학위수여식',
    isPrimary: true,
  },
  {
    title: '2027학년도 1학기 등록기간',
    startDate: '2027-02-19',
    endDate: '2027-02-26',
    type: 'multi',
    description: null,
    isPrimary: true,
  },
];

async function add2026AcademicSchedules() {
  try {
    console.log('🚀 2026학년도 학사일정 데이터 추가 시작...');

    const batch = db.batch();

    academicSchedules2026.forEach((schedule) => {
      const docRef = db.collection('academicSchedules').doc();
      batch.set(docRef, {
        ...schedule,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    const primaryCount = academicSchedules2026.filter(s => s.isPrimary).length;
    const normalCount = academicSchedules2026.filter(s => !s.isPrimary).length;

    console.log('✅ 2026학년도 학사일정 데이터 추가 완료!');
    console.log(`📊 총 ${academicSchedules2026.length}개 일정 (중요: ${primaryCount}개, 일반: ${normalCount}개)`);
    console.log('');
    console.log('📋 추가된 일정 목록:');
    academicSchedules2026.forEach((schedule, index) => {
      const marker = schedule.isPrimary ? '⭐' : '  ';
      console.log(`${marker} ${index + 1}. ${schedule.title} (${schedule.startDate} ~ ${schedule.endDate}) [${schedule.type}]`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    process.exit(0);
  }
}

add2026AcademicSchedules();
