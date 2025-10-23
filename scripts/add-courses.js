const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
const serviceAccount = require('../functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 신학과 수업 데이터
const theologyCourses = [
  {
    grade: 1,
    category: '전공필수',
    code: '22005',
    division: '001',
    name: '기독교세계관과진로',
    credits: 3,
    professor: '윤영훈',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기316',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20955',
    division: '001',
    name: '타문화 탐험과 대화',
    credits: 3,
    professor: '구성모',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '재706호',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21176',
    division: '001',
    name: '문화콘텐츠: 창작과 비평',
    credits: 3,
    professor: '윤영훈',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '재502호 강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21475',
    division: '001',
    name: '신약성서이야기',
    credits: 3,
    professor: '신성관',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기502',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21950',
    division: '001',
    name: '교육과커뮤니케이션',
    credits: 3,
    professor: '박은혜',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기316',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00158',
    division: '001',
    name: '한국교회사',
    credits: 3,
    professor: '김찬형',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기316',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20438',
    division: '001',
    name: '레포츠와 선교',
    credits: 3,
    professor: '윤승범',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '재507호 강의실(혁신)',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21475',
    division: '002',
    name: '신약성서이야기',
    credits: 3,
    professor: '박정수',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21493',
    division: '001',
    name: '청소년상담실습',
    credits: 3,
    professor: 'BAEK BYEOL AH',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기316',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20950',
    division: '001',
    name: '예배와 공연기획',
    credits: 3,
    professor: '백종범',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '재502호 강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21485',
    division: '001',
    name: '영암신학과성결교회사',
    credits: 3,
    professor: '이광열',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기502',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21487',
    division: '001',
    name: '설교작성실습',
    credits: 3,
    professor: '이재민',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기502',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21492',
    division: '001',
    name: '이스라엘의예언자',
    credits: 3,
    professor: '최기수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기502',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21639',
    division: '002',
    name: '학원복음화인큐베이팅(학생제안과목)',
    credits: 3,
    professor: '최새롬',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '재502호 강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '00471',
    division: '001',
    name: '예배와설교',
    credits: 3,
    professor: '오현철',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '00520',
    division: '001',
    name: '기독교교육행정',
    credits: 3,
    professor: '이은성',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기316',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '04531',
    division: '001',
    name: '사중복음',
    credits: 3,
    professor: '김윤석',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20419',
    division: '001',
    name: '성서히브리어',
    credits: 3,
    professor: '최종원',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '재502호 강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '신학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 기독교교육상담학과 수업 데이터
const educationCounselingCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '19466',
    division: '001',
    name: '상담의이론과실제',
    credits: 3,
    professor: '조안나',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20959',
    division: '001',
    name: '청소년문화',
    credits: 3,
    professor: '이보라',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기502',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21455',
    division: '001',
    name: '기독교교육과미디어',
    credits: 3,
    professor: '박은혜',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20422',
    division: '001',
    name: '성서교수법',
    credits: 3,
    professor: '박은혜',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기502',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20965',
    division: '001',
    name: '기독교교육과예술치료',
    credits: 3,
    professor: '박미라',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21148',
    division: '001',
    name: '청소년문제와보호',
    credits: 3,
    professor: '명봉호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21696',
    division: '001',
    name: '리더십과코칭',
    credits: 3,
    professor: '이은성',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21697',
    division: '001',
    name: '어린이·청소년상담및사역',
    credits: 3,
    professor: '박선희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00511',
    division: '001',
    name: '한국교회역사개론',
    credits: 3,
    professor: '윤형석',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기502',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18208',
    division: '001',
    name: '종교교과교육론',
    credits: 3,
    professor: '박은혜',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기502',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20966',
    division: '001',
    name: '청소년심리및상담',
    credits: 3,
    professor: '박지원',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기307',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21639',
    division: '001',
    name: '학원복음화인큐베이팅(학생제안과목)',
    credits: 3,
    professor: '최새롬',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '재502호 강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '00520',
    division: '002',
    name: '기독교교육행정',
    credits: 3,
    professor: '이은성',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기316',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '21148',
    division: '002',
    name: '청소년문제와보호',
    credits: 3,
    professor: '명봉호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '21149',
    division: '001',
    name: '청소년복지',
    credits: 3,
    professor: '명봉호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기318',
    note: '',
    semester: '2025-2',
    department: '기독교교육상담학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 문화선교학과 수업 데이터
const culturalMissionCourses = [
  {
    grade: 2,
    category: '전공선택',
    code: '21471',
    division: '001',
    name: '아시아사회의이해',
    credits: 3,
    professor: '이수환',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기315',
    note: '',
    semester: '2025-2',
    department: '문화선교학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21478',
    division: '001',
    name: '사회적기업:창업과경영',
    credits: 3,
    professor: '박한별',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기502',
    note: '',
    semester: '2025-2',
    department: '문화선교학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21480',
    division: '001',
    name: '현대음악과CCM',
    credits: 3,
    professor: '윤영훈',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '재502호 강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '문화선교학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20950',
    division: '002',
    name: '예배와 공연기획',
    credits: 3,
    professor: '백종범',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '재502호 강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '문화선교학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21466',
    division: '001',
    name: '국제인권법',
    credits: 3,
    professor: '이수환',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기315',
    note: '',
    semester: '2025-2',
    department: '문화선교학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21468',
    division: '001',
    name: '1인미디어워크숍',
    credits: 3,
    professor: '백종범',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '재502호 강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '문화선교학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21481',
    division: '001',
    name: '영화제작:이론과실재',
    credits: 3,
    professor: '장다나',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기316',
    note: '',
    semester: '2025-2',
    department: '문화선교학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21639',
    division: '003',
    name: '학원복음화인큐베이팅(학생제안과목)',
    credits: 3,
    professor: '최새롬',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '재502호 강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '문화선교학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20440',
    division: '001',
    name: '문화와 선교: 이슈와 사례 (원격수업)',
    credits: 3,
    professor: '정미경',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '재705호',
    note: '원격수업',
    semester: '2025-2',
    department: '문화선교학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 영어영문학과 수업 데이터
const englishLiteratureCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '01006',
    division: '001',
    name: '영어회화(2)',
    credits: 3,
    professor: 'PFOERTNER EVA MARIA MAXINE',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영303',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01006',
    division: '002',
    name: '영어회화(2)',
    credits: 3,
    professor: 'PFOERTNER EVA MARIA MAXINE',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영303',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01006',
    division: '003',
    name: '영어회화(2)',
    credits: 3,
    professor: 'CORCORAN WILLIAM JOSEPH',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영303',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01092',
    division: '001',
    name: '영어글쓰기(2)',
    credits: 3,
    professor: 'CORCORAN WILLIAM JOSEPH',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영306',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01092',
    division: '003',
    name: '영어글쓰기(2)',
    credits: 3,
    professor: 'PFOERTNER EVA MARIA MAXINE',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영306',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01094',
    division: '001',
    name: '미국문학개론',
    credits: 3,
    professor: '김희선',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영206(인문대 혁신강의실)',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '07429',
    division: '001',
    name: '영어어휘연구',
    credits: 3,
    professor: '이정아',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영306',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20912',
    division: '001',
    name: 'IT와 영어영문학',
    credits: 3,
    professor: '표시연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영306',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01043',
    division: '001',
    name: '미국소설',
    credits: 3,
    professor: '김희선',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영206(인문대 혁신강의실)',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01060',
    division: '001',
    name: '영어교육론',
    credits: 3,
    professor: '이정아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영306',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01080',
    division: '001',
    name: '미국시',
    credits: 3,
    professor: '김희선',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영206(인문대 혁신강의실)',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '02404',
    division: '001',
    name: '영어자유토론',
    credits: 3,
    professor: 'PFOERTNER EVA MARIA MAXINE',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영303',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18347',
    division: '001',
    name: 'Business English',
    credits: 3,
    professor: 'CORCORAN WILLIAM JOSEPH',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영303',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01065',
    division: '001',
    name: '영어학특강',
    credits: 3,
    professor: '손현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영306',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '18323',
    division: '001',
    name: '영어프리젠테이션',
    credits: 3,
    professor: 'CORCORAN WILLIAM JOSEPH',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영303',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19801',
    division: '001',
    name: '국제무역영어',
    credits: 3,
    professor: '이정아',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영306',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01092',
    division: '002',
    name: '영어글쓰기(2)(원격수업)',
    credits: 3,
    professor: 'CORCORAN WILLIAM JOSEPH',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '영303',
    note: '원격수업',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01094',
    division: '002',
    name: '미국문학개론(원격수업)',
    credits: 3,
    professor: '김희선',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '영306',
    note: '원격수업',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '02404',
    division: '002',
    name: '영어자유토론',
    credits: 3,
    professor: 'PFOERTNER EVA MARIA MAXINE',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '영306',
    note: '',
    semester: '2025-2',
    department: '영어영문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 중어중문학과 수업 데이터
const chineseLiteratureCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '19586',
    division: '001',
    name: '중국문화와도시공간',
    credits: 3,
    professor: '문정진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19586',
    division: '002',
    name: '중국문화와도시공간',
    credits: 3,
    professor: '문정진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영107(인문대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21141',
    division: '001',
    name: '현대중국의이해',
    credits: 3,
    professor: '심혜영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21690',
    division: '001',
    name: '기초중국어회화(심화)',
    credits: 3,
    professor: 'ZHENG DIAN HUI',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21690',
    division: '002',
    name: '기초중국어회화(심화)',
    credits: 3,
    professor: 'ZHENG DIAN HUI',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '02151',
    division: '001',
    name: '중국어학입문',
    credits: 3,
    professor: 'SUN ZHEN',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '02152',
    division: '001',
    name: '영상중국어',
    credits: 3,
    professor: 'ZHENG DIAN HUI',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '02153',
    division: '001',
    name: '중급중국어강독',
    credits: 3,
    professor: '빈미정',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '06318',
    division: '001',
    name: '중국고전사상의이해',
    credits: 3,
    professor: '빈미정',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18212',
    division: '001',
    name: '중국어교과교재연구및지도법',
    credits: 3,
    professor: 'SUN ZHEN',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20987',
    division: '002',
    name: '진로와취창업',
    credits: 2,
    professor: '문정진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21692',
    division: '001',
    name: '실용중국어회화(심화)',
    credits: 3,
    professor: 'SUN ZHEN',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '02108',
    division: '001',
    name: '선교중국어',
    credits: 3,
    professor: '빈미정',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '02117',
    division: '001',
    name: '중국어작문',
    credits: 3,
    professor: 'SUN ZHEN',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '07507',
    division: '001',
    name: '중국현당대작품감상',
    credits: 3,
    professor: '심혜영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19588',
    division: '001',
    name: '비즈니스중국어(2)',
    credits: 3,
    professor: 'ZHENG DIAN HUI',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '02156',
    division: '001',
    name: '중국어번역연습',
    credits: 3,
    professor: '심혜영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영206(인문대 혁신강의실)',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '07455',
    division: '001',
    name: '시사중국어',
    credits: 3,
    professor: 'ZHENG DIAN HUI',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '중어중문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 국어국문학과 수업 데이터
const koreanLiteratureCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '01945',
    division: '001',
    name: '세계문학의흐름',
    credits: 3,
    professor: '김효재',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '17826',
    division: '001',
    name: '문화콘텐츠론',
    credits: 3,
    professor: '표가령',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19580',
    division: '001',
    name: '고전문학의세계',
    credits: 3,
    professor: '표가령',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21518',
    division: '001',
    name: '문장작법이해',
    credits: 3,
    professor: '우순조',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21521',
    division: '001',
    name: '한국어학개론',
    credits: 3,
    professor: '우순조',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01935',
    division: '001',
    name: '구비문학의이해',
    credits: 3,
    professor: '이종석',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영401',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21526',
    division: '001',
    name: '희곡창작실기론',
    credits: 3,
    professor: '이경욱',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영206(인문대 혁신강의실)',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21531',
    division: '001',
    name: '한국어전산학심화',
    credits: 3,
    professor: '우순조',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영107(인문대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21539',
    division: '001',
    name: '현대시론과현대시인론',
    credits: 3,
    professor: '김효재',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01938',
    division: '001',
    name: '소설창작실기론',
    credits: 3,
    professor: '나준성',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영206(인문대 혁신강의실)',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21519',
    division: '001',
    name: '방송작가론',
    credits: 3,
    professor: '이경욱',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영401',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21520',
    division: '001',
    name: '한류문화와대중문학',
    credits: 3,
    professor: '진영희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영401',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21525',
    division: '001',
    name: '고전시가의이해',
    credits: 3,
    professor: '이종석',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21537',
    division: '001',
    name: '한국어자료강독',
    credits: 3,
    professor: '우순조',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01934',
    division: '001',
    name: '현대문학연습',
    credits: 3,
    professor: '나준성',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영401',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01961',
    division: '001',
    name: '국어학특강',
    credits: 3,
    professor: '우순조',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19581',
    division: '001',
    name: '인문경영의세계',
    credits: 3,
    professor: '진영희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20443',
    division: '001',
    name: '한국어 담화와 의미',
    credits: 3,
    professor: '우순조',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영304',
    note: '',
    semester: '2025-2',
    department: '국어국문학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 사회복지학과 수업 데이터
const socialWorkCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '00825',
    division: '001',
    name: '인간행동과사회환경',
    credits: 3,
    professor: '조춘범',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '00825',
    division: '002',
    name: '인간행동과사회환경',
    credits: 3,
    professor: '이창숙',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '00825',
    division: '003',
    name: '인간행동과사회환경',
    credits: 3,
    professor: '김종욱',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '00825',
    division: '004',
    name: '인간행동과사회환경',
    credits: 3,
    professor: '김미숙',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20733',
    division: '001',
    name: '사회복지학개론',
    credits: 3,
    professor: '김현숙',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20738',
    division: '001',
    name: '사회복지역사',
    credits: 3,
    professor: '임아름',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중310',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20738',
    division: '002',
    name: '사회복지역사',
    credits: 3,
    professor: '박윤영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20738',
    division: '003',
    name: '사회복지역사',
    credits: 3,
    professor: '남은희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20738',
    division: '004',
    name: '사회복지역사',
    credits: 3,
    professor: '이원지',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00844',
    division: '001',
    name: '지역사회복지론',
    credits: 3,
    professor: '박미영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중310',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00844',
    division: '003',
    name: '지역사회복지론',
    credits: 3,
    professor: '박미영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00844',
    division: '004',
    name: '지역사회복지론',
    credits: 3,
    professor: '박미영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00853',
    division: '001',
    name: '노인복지론',
    credits: 3,
    professor: '김혜경',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중310',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00853',
    division: '003',
    name: '노인복지론',
    credits: 3,
    professor: '김혜경',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중310',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00875',
    division: '001',
    name: '가족복지론',
    credits: 3,
    professor: '김은재',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00875',
    division: '002',
    name: '가족복지론',
    credits: 3,
    professor: '이근주',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00875',
    division: '003',
    name: '가족복지론',
    credits: 3,
    professor: '김은재',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00878',
    division: '001',
    name: '사회복지실천기술론',
    credits: 3,
    professor: '신준옥',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00878',
    division: '002',
    name: '사회복지실천기술론',
    credits: 3,
    professor: '이찬영',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00878',
    division: '003',
    name: '사회복지실천기술론',
    credits: 3,
    professor: '신준옥',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00878',
    division: '004',
    name: '사회복지실천기술론',
    credits: 3,
    professor: '류태경',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20987',
    division: '003',
    name: '진로와취창업',
    credits: 2,
    professor: '김현숙',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20987',
    division: '015',
    name: '진로와취창업',
    credits: 2,
    professor: '김현숙',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00807',
    division: '001',
    name: '사회복지행정론',
    credits: 3,
    professor: '강현구',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00807',
    division: '003',
    name: '사회복지행정론',
    credits: 3,
    professor: '류태경',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00807',
    division: '004',
    name: '사회복지행정론',
    credits: 3,
    professor: '강현구',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00851',
    division: '001',
    name: '교정복지론',
    credits: 3,
    professor: '신연희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00851',
    division: '003',
    name: '교정복지론',
    credits: 3,
    professor: '신연희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00874',
    division: '001',
    name: '청소년복지론',
    credits: 3,
    professor: '이덕남',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중310',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00874',
    division: '003',
    name: '청소년복지론',
    credits: 3,
    professor: '강창실',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중310',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00881',
    division: '001',
    name: '사회복지현장실습(1)',
    credits: 3,
    professor: '김대성',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00881',
    division: '002',
    name: '사회복지현장실습(1)',
    credits: 3,
    professor: '윤순이',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중310',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00881',
    division: '003',
    name: '사회복지현장실습(1)',
    credits: 3,
    professor: '김대성',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00881',
    division: '004',
    name: '사회복지현장실습(1)',
    credits: 3,
    professor: '신준옥',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00881',
    division: '005',
    name: '사회복지현장실습(1)',
    credits: 3,
    professor: '김현숙',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00881',
    division: '006',
    name: '사회복지현장실습(1)',
    credits: 3,
    professor: '신준옥',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00887',
    division: '001',
    name: '사회복지자료분석론',
    credits: 3,
    professor: '김정희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중102(컴퓨터 실습실)',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20735',
    division: '001',
    name: '사회복지법제와실천',
    credits: 3,
    professor: '임아름',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20735',
    division: '003',
    name: '사회복지법제와실천',
    credits: 3,
    professor: '이화조',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중310',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20735',
    division: '004',
    name: '사회복지법제와실천',
    credits: 3,
    professor: '이화조',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21053',
    division: '001',
    name: '빈곤론',
    credits: 3,
    professor: '유재남',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21053',
    division: '003',
    name: '빈곤론',
    credits: 3,
    professor: '유재남',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '00846',
    division: '001',
    name: '여성복지론',
    credits: 3,
    professor: '이문재',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '00893',
    division: '001',
    name: '복지정보화론(원격수업)',
    credits: 3,
    professor: '신연희',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중310',
    note: '원격수업',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '00893',
    division: '003',
    name: '복지정보화론(원격수업)',
    credits: 3,
    professor: '신연희',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중310',
    note: '원격수업',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20736',
    division: '001',
    name: '의료사회복지론',
    credits: 3,
    professor: '이지혜',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중302',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20736',
    division: '002',
    name: '의료사회복지론',
    credits: 3,
    professor: '이근주',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중310',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20736',
    division: '003',
    name: '의료사회복지론',
    credits: 3,
    professor: '이지혜',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중301',
    note: '',
    semester: '2025-2',
    department: '사회복지학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 국제개발협력학과 수업 데이터
const internationalDevelopmentCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '00703',
    division: '001',
    name: '경제학개론',
    credits: 3,
    professor: '김철민',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중208',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '00742',
    division: '001',
    name: '도시학개론',
    credits: 3,
    professor: '문정혜',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중209',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '18463',
    division: '001',
    name: '공간구조론',
    credits: 3,
    professor: '임형백',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중209',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21447',
    division: '001',
    name: '지역사회개발프로젝트',
    credits: 3,
    professor: '남수연',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중208',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00701',
    division: '001',
    name: '사회학개론',
    credits: 3,
    professor: '임형백',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중209',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19894',
    division: '001',
    name: '국제개발협력기구론',
    credits: 3,
    professor: '김철민',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중208',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19895',
    division: '001',
    name: '지역조사방법론',
    credits: 3,
    professor: '남수연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중102(컴퓨터 실습실)',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19902',
    division: '001',
    name: '지역학개론',
    credits: 3,
    professor: '남수연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중208',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00708',
    division: '001',
    name: '지역경제론',
    credits: 3,
    professor: '우재영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중209',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19494',
    division: '001',
    name: '도시관리론',
    credits: 3,
    professor: '박상희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중209',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19899',
    division: '001',
    name: '국제관계론',
    credits: 3,
    professor: '임형백',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중209',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19900',
    division: '001',
    name: '국제개발협력의동향',
    credits: 3,
    professor: '남수연',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중208',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '04506',
    division: '001',
    name: '국토및지역정책론',
    credits: 3,
    professor: '박상희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중209',
    note: '',
    semester: '2025-2',
    department: '국제개발협력학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 행정학과 수업 데이터
const publicAdministrationCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '01201',
    division: '001',
    name: '행정학개론',
    credits: 3,
    professor: '송효진',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01212',
    division: '001',
    name: '헌법',
    credits: 3,
    professor: '최다혜',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01212',
    division: '002',
    name: '헌법',
    credits: 3,
    professor: '최다혜',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '18533',
    division: '001',
    name: '사회과학방법론',
    credits: 3,
    professor: '이찬희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '18533',
    division: '002',
    name: '사회과학방법론',
    credits: 3,
    professor: '송효진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01255',
    division: '001',
    name: '민법총칙',
    credits: 3,
    professor: '문상혁',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영401',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01255',
    division: '002',
    name: '민법총칙',
    credits: 3,
    professor: '문상혁',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중209',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01266',
    division: '001',
    name: '행정관리론',
    credits: 3,
    professor: '라휘문',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01266',
    division: '002',
    name: '행정관리론',
    credits: 3,
    professor: '라휘문',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '17851',
    division: '001',
    name: '정책분석론',
    credits: 3,
    professor: '남기범',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '17851',
    division: '003',
    name: '정책분석론',
    credits: 3,
    professor: '남기범',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20453',
    division: '001',
    name: '형사법',
    credits: 3,
    professor: '김재희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20453',
    division: '002',
    name: '형사법',
    credits: 3,
    professor: '김재희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01209',
    division: '001',
    name: '한국정부론',
    credits: 3,
    professor: '서인석',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01209',
    division: '002',
    name: '한국정부론',
    credits: 3,
    professor: '서인석',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01250',
    division: '001',
    name: '공기업론',
    credits: 3,
    professor: '임정빈',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01250',
    division: '002',
    name: '공기업론',
    credits: 3,
    professor: '임정빈',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01254',
    division: '001',
    name: '도시행정론',
    credits: 3,
    professor: '송효진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01254',
    division: '002',
    name: '도시행정론',
    credits: 3,
    professor: '임정빈',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 13,
        endPeriod: 15
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01230',
    division: '001',
    name: '정책사례연구',
    credits: 3,
    professor: '이규민',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01269',
    division: '001',
    name: '행정학연습',
    credits: 3,
    professor: '서인석',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01269',
    division: '002',
    name: '행정학연습',
    credits: 3,
    professor: '임정빈',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '06222',
    division: '001',
    name: '지방재정론',
    credits: 3,
    professor: '이용환',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20457',
    division: '001',
    name: '현대행정과NGO',
    credits: 3,
    professor: '허아랑',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20458',
    division: '001',
    name: '정부회계론',
    credits: 3,
    professor: '박관태',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '행정학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 관광학과 수업 데이터
const tourismCourses = [
  {
    grade: 1,
    category: '전공필수',
    code: '19913',
    division: '001',
    name: '관광학개론',
    credits: 3,
    professor: '김경배',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '19913',
    division: '002',
    name: '관광학개론',
    credits: 3,
    professor: '김경배',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21667',
    division: '001',
    name: '관광영어',
    credits: 3,
    professor: '김정아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21668',
    division: '001',
    name: '환대산업론',
    credits: 3,
    professor: '최영숙',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '20634',
    division: '001',
    name: '관광법규',
    credits: 3,
    professor: '김정아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '20634',
    division: '003',
    name: '관광법규',
    credits: 3,
    professor: '박지원',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '027',
    name: '진로탐색(2)',
    credits: 3,
    professor: '김경배',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21672',
    division: '001',
    name: '외식산업론',
    credits: 3,
    professor: '김경배',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21672',
    division: '002',
    name: '외식산업론',
    credits: 3,
    professor: '김경배',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21673',
    division: '001',
    name: '식음료서비스개론',
    credits: 3,
    professor: '홍희선',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중209',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21674',
    division: '001',
    name: '관광행동론',
    credits: 3,
    professor: '김민경',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21675',
    division: '001',
    name: '항공산업론',
    credits: 3,
    professor: '민병원',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21676',
    division: '001',
    name: '호텔관광영어(중급)',
    credits: 3,
    professor: '최영숙',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중310',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19918',
    division: '001',
    name: '관광상품개발론',
    credits: 3,
    professor: '홍희선',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21340',
    division: '001',
    name: '문화축제이벤트론',
    credits: 3,
    professor: '김민경',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중308',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21356',
    division: '001',
    name: '관광조사분석론',
    credits: 3,
    professor: '박지원',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중102(컴퓨터 실습실)',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19943',
    division: '001',
    name: '호텔현장실습',
    credits: 3,
    professor: '최영숙',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20637',
    division: '001',
    name: '관광회사실무실습',
    credits: 3,
    professor: '민병원',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영311',
    note: '',
    semester: '2025-2',
    department: '관광학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 경영학과 수업 데이터
const businessCourses = [
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '001',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'GOLEMB DANIEL ROGER',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '002',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'GOLEMB DANIEL ROGER',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '중102(컴퓨터 실습실)',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '003',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'GOLEMB DANIEL ROGER',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '004',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'GOLEMB DANIEL ROGER',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '중306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '005',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'GOLEMB DANIEL ROGER',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '중102(컴퓨터 실습실)',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '006',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'OREILLY HAYES RORY PHILIP',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중406',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '007',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'OREILLY HAYES RORY PHILIP',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '008',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'OREILLY HAYES RORY PHILIP',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '009',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'OREILLY HAYES RORY PHILIP',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '영303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '010',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'NEPAL SURYA',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18287',
    division: '011',
    name: '비즈니스영어(2)',
    credits: 2,
    professor: 'NEPAL SURYA',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중305',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01102',
    division: '001',
    name: '경제학원론',
    credits: 3,
    professor: '조군현',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01102',
    division: '002',
    name: '경제학원론',
    credits: 3,
    professor: '김동영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01102',
    division: '004',
    name: '경제학원론',
    credits: 3,
    professor: '민윤지',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '17855',
    division: '001',
    name: '기업경영의이해',
    credits: 3,
    professor: '이재연',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '17855',
    division: '002',
    name: '기업경영의이해',
    credits: 3,
    professor: '서일범',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '17855',
    division: '003',
    name: '기업경영의이해',
    credits: 3,
    professor: '고운실',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19220',
    division: '001',
    name: '경영과통계',
    credits: 3,
    professor: '박명현',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19220',
    division: '002',
    name: '경영과통계',
    credits: 3,
    professor: '박명현',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19220',
    division: '003',
    name: '경영과통계',
    credits: 3,
    professor: '전병삼',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19582',
    division: '001',
    name: '창업전략론',
    credits: 3,
    professor: '정병규',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19582',
    division: '002',
    name: '창업전략론',
    credits: 3,
    professor: '김신애',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19582',
    division: '003',
    name: '창업전략론',
    credits: 3,
    professor: '김신애',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01118',
    division: '001',
    name: '국제기업환경론(원격수업)',
    credits: 3,
    professor: '이윤선',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중304',
    note: '원격수업',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01118',
    division: '002',
    name: '국제기업환경론(원격수업)',
    credits: 3,
    professor: '이윤선',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중304',
    note: '원격수업',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01118',
    division: '003',
    name: '국제기업환경론',
    credits: 3,
    professor: '이윤선',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01159',
    division: '001',
    name: '원가회계',
    credits: 3,
    professor: '최현정',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01159',
    division: '002',
    name: '원가회계(원격수업)',
    credits: 3,
    professor: '최현정',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중303',
    note: '원격수업',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01159',
    division: '003',
    name: '원가회계',
    credits: 3,
    professor: '심지수',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01159',
    division: '004',
    name: '원가회계',
    credits: 3,
    professor: '최현정',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영401',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01166',
    division: '001',
    name: '투자론',
    credits: 3,
    professor: '김선제',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01166',
    division: '002',
    name: '투자론',
    credits: 3,
    professor: '김선제',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01166',
    division: '003',
    name: '투자론',
    credits: 3,
    professor: '김선제',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01122',
    division: '001',
    name: '경영정보시스템',
    credits: 3,
    professor: '이수진',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01122',
    division: '002',
    name: '경영정보시스템',
    credits: 3,
    professor: '이수진',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01123',
    division: '001',
    name: '재무분석론',
    credits: 3,
    professor: '박광현',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01154',
    division: '001',
    name: '관리회계',
    credits: 3,
    professor: '최현정',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '06293',
    division: '001',
    name: '경영전략',
    credits: 3,
    professor: '곽보선',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '06293',
    division: '002',
    name: '경영전략',
    credits: 3,
    professor: '곽보선',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '06293',
    division: '003',
    name: '경영전략',
    credits: 3,
    professor: '권미영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '06293',
    division: '004',
    name: '경영전략',
    credits: 3,
    professor: '권미영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21357',
    division: '001',
    name: '서비스마케팅',
    credits: 3,
    professor: '정병규',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21357',
    division: '002',
    name: '서비스마케팅',
    credits: 3,
    professor: '김신애',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01126',
    division: '001',
    name: '금융시장론',
    credits: 3,
    professor: '조군현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01126',
    division: '002',
    name: '금융시장론(원격수업)',
    credits: 3,
    professor: '조군현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중306',
    note: '원격수업',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01142',
    division: '001',
    name: '광고론',
    credits: 3,
    professor: '김미현',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중304',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '07060',
    division: '001',
    name: 'SCM',
    credits: 3,
    professor: '이수진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영501',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19224',
    division: '001',
    name: '다국적기업론',
    credits: 3,
    professor: '정병규',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19224',
    division: '002',
    name: '다국적기업론(원격수업)',
    credits: 3,
    professor: '정병규',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중306',
    note: '원격수업',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20447',
    division: '001',
    name: 'NCS와노사관계론',
    credits: 3,
    professor: '김동영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20447',
    division: '002',
    name: 'NCS와노사관계론',
    credits: 3,
    professor: '김동영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중306',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '21784',
    division: '007',
    name: '현장실습(4-2)',
    credits: 12,
    professor: '최현정',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 12
      }
    ],
    location: '중303',
    note: '',
    semester: '2025-2',
    department: '경영학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 글로벌물류학과 수업 데이터
const globalLogisticsCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '02002',
    division: '001',
    name: '기초일본어(2)',
    credits: 3,
    professor: '임태균',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '02002',
    division: '002',
    name: '기초일본어(2)',
    credits: 3,
    professor: 'AIZAWA YUKA',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '02002',
    division: '003',
    name: '기초일본어(2)',
    credits: 3,
    professor: 'AIZAWA YUKA',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '02002',
    division: '004',
    name: '기초일본어(2)',
    credits: 3,
    professor: 'AIZAWA YUKA',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21125',
    division: '001',
    name: '글로벌물류입문',
    credits: 3,
    professor: '정태원',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중406',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21125',
    division: '002',
    name: '글로벌물류입문',
    credits: 3,
    professor: '정준모',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영205',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21125',
    division: '003',
    name: '글로벌물류입문',
    credits: 3,
    professor: '정준모',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영205',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21922',
    division: '001',
    name: '글로벌컬처마이닝',
    credits: 3,
    professor: '이준서',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중406',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21949',
    division: '001',
    name: '물류데이터분석기초',
    credits: 3,
    professor: '전준우',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성B101(산경)',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19850',
    division: '001',
    name: '일본물류기업론',
    credits: 3,
    professor: '한종길',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중406',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '03011',
    division: '001',
    name: '기초마케팅',
    credits: 3,
    professor: '신현주',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중307',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '17827',
    division: '001',
    name: '일본어와문화',
    credits: 3,
    professor: '김혜연',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영205',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '17827',
    division: '002',
    name: '일본어와문화',
    credits: 3,
    professor: '김혜연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중102(컴퓨터 실습실)',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18113',
    division: '001',
    name: '운송물류론',
    credits: 3,
    professor: '임종석',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중406',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18113',
    division: '002',
    name: '운송물류론',
    credits: 3,
    professor: '임종석',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중406',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19500',
    division: '001',
    name: '물류통계론',
    credits: 3,
    professor: '전준우',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영205',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19500',
    division: '002',
    name: '물류통계론',
    credits: 3,
    professor: '전준우',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영205',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20711',
    division: '001',
    name: '글로벌구매관리론',
    credits: 3,
    professor: '곽수영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20711',
    division: '002',
    name: '글로벌구매관리론',
    credits: 3,
    professor: '곽수영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20987',
    division: '008',
    name: '진로와취창업',
    credits: 2,
    professor: '손승표',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '07060',
    division: '003',
    name: 'SCM',
    credits: 3,
    professor: '문인구',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중307',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '07060',
    division: '004',
    name: 'SCM',
    credits: 3,
    professor: '문인구',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중307',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20452',
    division: '001',
    name: '일본물류신문읽기',
    credits: 3,
    professor: '임태균',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20712',
    division: '001',
    name: '물류컨설팅방법론',
    credits: 3,
    professor: '임종석',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '17999',
    division: '001',
    name: '물류프로젝트관리',
    credits: 3,
    professor: '전준우',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영205',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19611',
    division: '001',
    name: '글로벌기업연구',
    credits: 3,
    professor: '한종길',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중406',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19611',
    division: '002',
    name: '글로벌기업연구',
    credits: 3,
    professor: '이준서',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중406',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19611',
    division: '003',
    name: '글로벌기업연구',
    credits: 3,
    professor: '손승표',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19483',
    division: '001',
    name: '무역학개론',
    credits: 3,
    professor: '신현주',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19483',
    division: '002',
    name: '무역학개론',
    credits: 3,
    professor: '신현주',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19521',
    division: '002',
    name: '항만물류론',
    credits: 3,
    professor: '문인구',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중307',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19597',
    division: '001',
    name: '중급일본어(2)',
    credits: 3,
    professor: '임태균',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19597',
    division: '002',
    name: '중급일본어(2)',
    credits: 3,
    professor: '임태균',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21123',
    division: '001',
    name: '동아시아와평화',
    credits: 3,
    professor: '박경진',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영205',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21123',
    division: '002',
    name: '동아시아와평화',
    credits: 3,
    professor: '박경진',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영205',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18118',
    division: '001',
    name: '무역영어',
    credits: 3,
    professor: '손승표',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중307',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18118',
    division: '002',
    name: '무역영어',
    credits: 3,
    professor: '손승표',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중307',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '17999',
    division: '002',
    name: '물류프로젝트관리',
    credits: 3,
    professor: '정태원',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중406',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '18504',
    division: '001',
    name: '무역보험론',
    credits: 3,
    professor: '손승표',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중307',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '18504',
    division: '002',
    name: '무역보험론',
    credits: 3,
    professor: '손승표',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중307',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '21126',
    division: '001',
    name: '글로벌리서치',
    credits: 3,
    professor: '임태균',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중206',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '21784',
    division: '011',
    name: '현장실습(4-2)',
    credits: 12,
    professor: '전준우',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 12
      }
    ],
    location: '중406',
    note: '',
    semester: '2025-2',
    department: '글로벌물류학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 산업경영공학과 수업 데이터
const industrialEngineeringCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '07761',
    division: '003',
    name: '확률과통계',
    credits: 3,
    professor: '엄용환',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성107(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '07761',
    division: '004',
    name: '확률과통계',
    credits: 3,
    professor: '엄용환',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성107(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20470',
    division: '001',
    name: '파이썬프로그래밍',
    credits: 3,
    professor: '유석환',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성107(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20470',
    division: '006',
    name: '파이썬프로그래밍',
    credits: 3,
    professor: '유석환',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성107(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18472',
    division: '001',
    name: '공급망관리',
    credits: 3,
    professor: '임승길',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성108(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18472',
    division: '002',
    name: '공급망관리',
    credits: 3,
    professor: '임승길',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성108(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20975',
    division: '001',
    name: '작업 분석 및 설계',
    credits: 3,
    professor: '김태광',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성108(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20975',
    division: '002',
    name: '작업 분석 및 설계',
    credits: 3,
    professor: '김태광',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성108(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21112',
    division: '001',
    name: '데이터베이스 활용',
    credits: 3,
    professor: '이시영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성107(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21112',
    division: '002',
    name: '데이터베이스 활용',
    credits: 3,
    professor: '이시영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성107(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18373',
    division: '001',
    name: '시스템시뮬레이션',
    credits: 3,
    professor: '임대은',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성108(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21364',
    division: '001',
    name: '인공지능 프로그래밍',
    credits: 3,
    professor: '방준영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성109(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21364',
    division: '002',
    name: '인공지능 프로그래밍',
    credits: 3,
    professor: '방준영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성109(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21365',
    division: '001',
    name: '강화학습',
    credits: 3,
    professor: '임승길',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성108(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21366',
    division: '001',
    name: '산업경영 인공지능 모델링',
    credits: 3,
    professor: '임승길',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성109(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19542',
    division: '001',
    name: '산업경영공학실무',
    credits: 3,
    professor: '심재영',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성107(산경)',
    note: '',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '21114',
    division: '001',
    name: '빅데이터와 머신러닝 활용(원격병행수업)',
    credits: 3,
    professor: '방준영',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성B101(산경)',
    note: '원격병행수업',
    semester: '2025-2',
    department: '산업경영공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 유아교육과 수업 데이터
const earlyChildhoodEducationCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '00151',
    division: '001',
    name: '아동문학',
    credits: 3,
    professor: '조유진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19229',
    division: '001',
    name: '영유아발달과교육',
    credits: 3,
    professor: '신수진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영108(사범대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19229',
    division: '002',
    name: '영유아발달과교육',
    credits: 3,
    professor: '신수진',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20706',
    division: '001',
    name: '언어발달장애',
    credits: 3,
    professor: '장윤용',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21359',
    division: '001',
    name: '아동권리와복지',
    credits: 3,
    professor: '오성은',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영206(인문대 혁신강의실)',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21359',
    division: '002',
    name: '아동권리와복지',
    credits: 3,
    professor: '오성은',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00904',
    division: '001',
    name: '유아놀이지도',
    credits: 3,
    professor: '김수희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영108(사범대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00904',
    division: '002',
    name: '유아놀이지도',
    credits: 3,
    professor: '김수희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00907',
    division: '001',
    name: '유아수학교육',
    credits: 3,
    professor: '오성은',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영403',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '00907',
    division: '002',
    name: '유아수학교육',
    credits: 3,
    professor: '오성은',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20701',
    division: '001',
    name: '정서장애아교육',
    credits: 3,
    professor: '구본경',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '00959',
    division: '001',
    name: '유아건강교육',
    credits: 3,
    professor: '신수진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18219',
    division: '001',
    name: '유아교과교육론',
    credits: 3,
    professor: '신수진',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18219',
    division: '002',
    name: '유아교과교육론',
    credits: 3,
    professor: '신수진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18375',
    division: '001',
    name: '아동관찰및행동연구',
    credits: 3,
    professor: '임은미',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20643',
    division: '001',
    name: '영유아프로그램개발및평가',
    credits: 3,
    professor: '오성은',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20703',
    division: '001',
    name: '자폐장애교육',
    credits: 3,
    professor: '구본경',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21360',
    division: '001',
    name: '유아안전교육',
    credits: 3,
    professor: '박수정',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '00901',
    division: '001',
    name: '부모교육',
    credits: 3,
    professor: '김수희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영108(사범대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '07219',
    division: '001',
    name: '유아교육기관운영관리',
    credits: 3,
    professor: '박수정',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영108(사범대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '18345',
    division: '001',
    name: '유아교과논리및논술',
    credits: 3,
    professor: '조유진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '18345',
    division: '002',
    name: '유아교과논리및논술',
    credits: 3,
    professor: '조유진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20622',
    division: '001',
    name: '보육실습II',
    credits: 3,
    professor: '이경진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '유아교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 체육교육과 수업 데이터
const physicalEducationCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '02503',
    division: '001',
    name: '체육원리(실기포함)',
    credits: 2,
    professor: '박현애',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '02503',
    division: '002',
    name: '체육원리(실기포함)',
    credits: 2,
    professor: '박현애',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '02522',
    division: '001',
    name: '스키(집중수업,학교밖수업)',
    credits: 1,
    professor: '허철무',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영108(사범대 스마트강의실)',
    note: '집중수업,학교밖수업',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '02522',
    division: '004',
    name: '스키(집중수업,학교밖수업)',
    credits: 1,
    professor: '최덕묵',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영404',
    note: '집중수업,학교밖수업',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '08030',
    division: '001',
    name: '해부학',
    credits: 2,
    professor: '한수지',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영403',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '08030',
    division: '002',
    name: '해부학',
    credits: 2,
    professor: '한수지',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영403',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20331',
    division: '001',
    name: '스포츠영어(2)',
    credits: 3,
    professor: 'LASHLEY KEITH ANDRE',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20331',
    division: '002',
    name: '스포츠영어(2)',
    credits: 3,
    professor: 'LASHLEY KEITH ANDRE',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21719',
    division: '001',
    name: '스포츠인성교육',
    credits: 2,
    professor: '허철무',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영403',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21720',
    division: '001',
    name: '스포츠테크와체육활동설계',
    credits: 2,
    professor: '홍석호',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영108(사범대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '02504',
    division: '001',
    name: '운동생리학',
    credits: 3,
    professor: '안상현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '02504',
    division: '002',
    name: '운동생리학',
    credits: 3,
    professor: '안상현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '02563',
    division: '001',
    name: '테니스(1)',
    credits: 2,
    professor: '최덕묵',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '06218',
    division: '001',
    name: '스포츠마사지및의료봉사',
    credits: 1,
    professor: '안상현',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '학318(무도실)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18221',
    division: '001',
    name: '체육교과교육론',
    credits: 3,
    professor: '홍석호',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영403',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18221',
    division: '002',
    name: '체육교과교육론',
    credits: 3,
    professor: '김철민',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영108(사범대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19640',
    division: '001',
    name: '기계체조(뜀틀/철봉)',
    credits: 2,
    professor: '안완식',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 8,
        endPeriod: 9
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19641',
    division: '001',
    name: '육상경기(필드)',
    credits: 2,
    professor: '여호수아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19688',
    division: '001',
    name: '노인체육론',
    credits: 2,
    professor: '김은혜',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20768',
    division: '001',
    name: '수영지도법 심화',
    credits: 2,
    professor: '최현수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영403',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20770',
    division: '001',
    name: '축구지도법 심화',
    credits: 2,
    professor: '이호열',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20777',
    division: '001',
    name: '탁구지도법 기초',
    credits: 1,
    professor: '김상태',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20987',
    division: '006',
    name: '진로와취창업',
    credits: 2,
    professor: '허철무',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '06216',
    division: '001',
    name: '체육교수법',
    credits: 2,
    professor: '홍석호',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '영403',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '06216',
    division: '002',
    name: '체육교수법',
    credits: 2,
    professor: '김철민',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '02540',
    division: '001',
    name: '건강교육',
    credits: 3,
    professor: '김은혜',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영403',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '02540',
    division: '002',
    name: '건강교육',
    credits: 3,
    professor: '양성지',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영108(사범대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '02572',
    division: '001',
    name: '체육측정평가',
    credits: 3,
    professor: '박규남',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영108(사범대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '02572',
    division: '002',
    name: '체육측정평가',
    credits: 3,
    professor: '박규남',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영403',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '02593',
    division: '001',
    name: '종합실기(1)',
    credits: 1,
    professor: '김상태',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20740',
    division: '001',
    name: '스포츠경영',
    credits: 2,
    professor: '허철무',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20772',
    division: '001',
    name: '배구지도법 심화',
    credits: 2,
    professor: '최덕묵',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20774',
    division: '001',
    name: '핸드볼지도법 심화',
    credits: 2,
    professor: '이동희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20774',
    division: '002',
    name: '핸드볼지도법 심화',
    credits: 2,
    professor: '이동희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20776',
    division: '001',
    name: '배드민턴지도법 심화',
    credits: 2,
    professor: '이호열',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20780',
    division: '001',
    name: '농구지도법 심화',
    credits: 2,
    professor: '김상태',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '02511',
    division: '001',
    name: '교육무용',
    credits: 1,
    professor: '이한숙',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '학318(무도실)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '06223',
    division: '001',
    name: '여가레크리에이션',
    credits: 1,
    professor: '이한숙',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '학318(무도실)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '18239',
    division: '001',
    name: '운동처방및스포츠영양학',
    credits: 2,
    professor: '안상현',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '18239',
    division: '002',
    name: '운동처방및스포츠영양학',
    credits: 2,
    professor: '안상현',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영404',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19852',
    division: '001',
    name: '종합무도',
    credits: 1,
    professor: '김상태',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '학318(무도실)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20742',
    division: '001',
    name: '종합실기3(네트형 경쟁)',
    credits: 1,
    professor: '김상태',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20743',
    division: '001',
    name: '종합실기4(필드형 경쟁)',
    credits: 1,
    professor: '안완식',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 6,
        endPeriod: 7
      }
    ],
    location: '학401(체육관)',
    note: '',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '22063',
    division: '001',
    name: '스포츠와인구구조변화대응(학생제안과목)',
    credits: 2,
    professor: '박규리',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영404',
    note: '학생제안과목',
    semester: '2025-2',
    department: '체육교육과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 교직부 수업 데이터
const teacherEducationCourses = [
  {
    grade: 1,
    category: '교직이수',
    code: '00202',
    division: '001',
    name: '교육심리(유교A)',
    credits: 2,
    professor: '곽은정',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교직이수',
    code: '00202',
    division: '002',
    name: '교육심리(유교B)',
    credits: 2,
    professor: '곽은정',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교직이수',
    code: '00202',
    division: '003',
    name: '교육심리(체교A+일반)',
    credits: 2,
    professor: '이수경',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교직이수',
    code: '00202',
    division: '004',
    name: '교육심리(체교B)',
    credits: 2,
    professor: '이수경',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교직이수',
    code: '00997',
    division: '001',
    name: '교육과정(유교A)',
    credits: 2,
    professor: '성진아',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교직이수',
    code: '00997',
    division: '002',
    name: '교육과정(유교B)',
    credits: 2,
    professor: '성진아',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교직이수',
    code: '00997',
    division: '003',
    name: '교육과정(체교A+일반)',
    credits: 2,
    professor: '이경진',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교직이수',
    code: '00997',
    division: '004',
    name: '교육과정(체교B)',
    credits: 2,
    professor: '이경진',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '00207',
    division: '001',
    name: '교육행정및교육경영(유교A)',
    credits: 2,
    professor: '조성범',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '00207',
    division: '003',
    name: '교육행정및교육경영(유교B)',
    credits: 2,
    professor: '조성범',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '00207',
    division: '004',
    name: '교육행정및교육경영(체교A+일반)',
    credits: 2,
    professor: '조성범',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 8,
        endPeriod: 9
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '00207',
    division: '005',
    name: '교육행정및교육경영(체교B)',
    credits: 2,
    professor: '조성범',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '18141',
    division: '001',
    name: '특수교육학개론(유교A)',
    credits: 2,
    professor: '임희수',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '18141',
    division: '002',
    name: '특수교육학개론(유교B)',
    credits: 2,
    professor: '임희수',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '18141',
    division: '003',
    name: '특수교육학개론(체교A+일반)',
    credits: 2,
    professor: '안도연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '영204',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '18141',
    division: '004',
    name: '특수교육학개론(체교B)',
    credits: 2,
    professor: '안도연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영108(사범대 스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '21634',
    division: '001',
    name: '디지털교육(유교A)',
    credits: 2,
    professor: '성지훈',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '21634',
    division: '002',
    name: '디지털교육(유교B)',
    credits: 2,
    professor: '성지훈',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 8,
        endPeriod: 9
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '21634',
    division: '003',
    name: '디지털교육(체교A+일반)',
    credits: 2,
    professor: '성지훈',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '교직이수',
    code: '21634',
    division: '004',
    name: '디지털교육(체교B)',
    credits: 2,
    professor: '성지훈',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 8,
        endPeriod: 9
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '교직이수',
    code: '00207',
    division: '002',
    name: '교육행정및교육경영(유교)',
    credits: 2,
    professor: '조성범',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '교직이수',
    code: '00207',
    division: '006',
    name: '교육행정및교육경영(체교+일반)',
    credits: 2,
    professor: '조성범',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 8,
        endPeriod: 9
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '교직이수',
    code: '18135',
    division: '001',
    name: '교직실무(유교A)',
    credits: 2,
    professor: '조유진',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '교직이수',
    code: '18135',
    division: '002',
    name: '교직실무(유교B)',
    credits: 2,
    professor: '조유진',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '교직이수',
    code: '18135',
    division: '003',
    name: '교직실무(체교A+일반)',
    credits: 2,
    professor: '임정연',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '교직이수',
    code: '18135',
    division: '004',
    name: '교직실무(체교B)',
    credits: 2,
    professor: '임정연',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 8,
        endPeriod: 9
      }
    ],
    location: '영108(사범대스마트강의실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '교직이수',
    code: '20908',
    division: '001',
    name: '학교현장실습 사전교육(일반)',
    credits: 1,
    professor: '성지훈',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '교직이수',
    code: '20908',
    division: '002',
    name: '학교현장실습 사전교육(체교A)',
    credits: 1,
    professor: '홍석호',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '영403',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '교직이수',
    code: '20908',
    division: '003',
    name: '학교현장실습 사전교육(유교)',
    credits: 1,
    professor: '이경진',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '중409(수업행동분석실)',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '교직이수',
    code: '08058',
    division: '001',
    name: '교육봉사활동(일반)',
    credits: 2,
    professor: '조성범',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영309',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '교직이수',
    code: '08058',
    division: '002',
    name: '교육봉사활동(체교)',
    credits: 2,
    professor: '안완식',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '교직이수',
    code: '08058',
    division: '003',
    name: '교육봉사활동(유교)',
    credits: 2,
    professor: '이경진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영305',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '교직이수',
    code: '20707',
    division: '001',
    name: '생활지도및상담',
    credits: 2,
    professor: '이수경',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 8,
        endPeriod: 9
      }
    ],
    location: '영307',
    note: '',
    semester: '2025-2',
    department: '교직부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 컴퓨터공학과 수업 데이터
const computerEngineeringCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '17856',
    division: '001',
    name: '창의적공학설계',
    credits: 3,
    professor: '강영명',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성407(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '17856',
    division: '002',
    name: '창의적공학설계',
    credits: 3,
    professor: '강영명',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성407(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '18360',
    division: '001',
    name: '컴퓨터공학입문',
    credits: 3,
    professor: '최정열',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성401(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20405',
    division: '001',
    name: 'C프로그래밍응용',
    credits: 3,
    professor: '박미옥',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성406(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20405',
    division: '002',
    name: 'C프로그래밍응용',
    credits: 3,
    professor: '박미옥',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성406(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20470',
    division: '002',
    name: '파이썬프로그래밍',
    credits: 3,
    professor: '박미옥',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성405(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20470',
    division: '004',
    name: '파이썬프로그래밍',
    credits: 3,
    professor: '박미옥',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성405(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20470',
    division: '005',
    name: '파이썬프로그래밍(원격수업)',
    credits: 3,
    professor: '김미연',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '성405(컴공)',
    note: '원격수업',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21702',
    division: '001',
    name: '전산수학(원격수업)',
    credits: 3,
    professor: '임태수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성407(컴공)',
    note: '원격수업',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21702',
    division: '002',
    name: '전산수학(원격수업)',
    credits: 3,
    professor: '임태수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성407(컴공)',
    note: '원격수업',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '01605',
    division: '001',
    name: '데이터베이스',
    credits: 3,
    professor: '한경수',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성405(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '01605',
    division: '003',
    name: '데이터베이스',
    credits: 3,
    professor: '한경수',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성405(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '01605',
    division: '004',
    name: '데이터베이스',
    credits: 3,
    professor: '한경수',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성405(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01364',
    division: '001',
    name: '컴퓨터네트워크(원격수업)',
    credits: 3,
    professor: '최정열',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성404(컴공)',
    note: '원격수업',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01364',
    division: '002',
    name: '컴퓨터네트워크(원격수업)',
    credits: 3,
    professor: '최정열',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성404(컴공)',
    note: '원격수업',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18445',
    division: '001',
    name: '웹 표준기술',
    credits: 3,
    professor: '심미나',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성405(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18445',
    division: '002',
    name: '웹 표준기술',
    credits: 3,
    professor: '심미나',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성405(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20461',
    division: '001',
    name: '자바프로그래밍응용',
    credits: 3,
    professor: '최용석',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성406(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20461',
    division: '002',
    name: '자바프로그래밍응용',
    credits: 3,
    professor: '최용석',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성406(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '011',
    name: '진로탐색(2)(Course Scheduler)',
    credits: 3,
    professor: '강영명',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '성407(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '015',
    name: '진로탐색(2)(로그라이크 TEXT RPG)',
    credits: 3,
    professor: '강영명',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 7,
        endPeriod: 12
      }
    ],
    location: '성407(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '016',
    name: '진로탐색(2)(RoastMaster AI)',
    credits: 3,
    professor: '강영명',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 12
      }
    ],
    location: '성407(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '017',
    name: '진로탐색(2)(실내조명 자동화시스템 구축)',
    credits: 3,
    professor: '최정열',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '성405(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '018',
    name: '진로탐색(2)(AI 주식예측 서비스)',
    credits: 3,
    professor: '최정열',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 7,
        endPeriod: 12
      }
    ],
    location: '성405(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '019',
    name: '진로탐색(2)(알바이야기)',
    credits: 3,
    professor: '최정열',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 12
      }
    ],
    location: '성405(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '020',
    name: '진로탐색(2)(iOS프로그래밍 마스터과정)',
    credits: 3,
    professor: '임태수',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '성406(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '021',
    name: '진로탐색(2)(메추리얼 기반)',
    credits: 3,
    professor: '임태수',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 7,
        endPeriod: 12
      }
    ],
    location: '성406(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '022',
    name: '진로탐색(2)(Smart Tax Assistant)',
    credits: 3,
    professor: '한경수',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '성404(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '023',
    name: '진로탐색(2)(음악플레이리스트 관리시스템)',
    credits: 3,
    professor: '한경수',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 7,
        endPeriod: 12
      }
    ],
    location: '성404(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '024',
    name: '진로탐색(2)(실무형백엔드 시스템구축)',
    credits: 3,
    professor: '한경수',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 12
      }
    ],
    location: '성404(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21703',
    division: '001',
    name: '확률통계',
    credits: 3,
    professor: '임태수',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성406(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21703',
    division: '002',
    name: '확률통계',
    credits: 3,
    professor: '임태수',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성406(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '01305',
    division: '001',
    name: '컴퓨터구조',
    credits: 3,
    professor: '최정열',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성404(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '01305',
    division: '002',
    name: '컴퓨터구조',
    credits: 3,
    professor: '최정열',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성404(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '01308',
    division: '001',
    name: '운영체제(원격수업)',
    credits: 3,
    professor: '강영명',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성407(컴공)',
    note: '원격수업',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '01308',
    division: '002',
    name: '운영체제(원격수업)',
    credits: 3,
    professor: '강영명',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성407(컴공)',
    note: '원격수업',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '17960',
    division: '001',
    name: '전공종합설계(1)',
    credits: 3,
    professor: '임태수',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성407(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '17960',
    division: '002',
    name: '전공종합설계(1)',
    credits: 3,
    professor: '임태수',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성407(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01699',
    division: '001',
    name: '임베디드시스템',
    credits: 3,
    professor: '김동성',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성404(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01699',
    division: '002',
    name: '임베디드시스템',
    credits: 3,
    professor: '김동성',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성404(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20356',
    division: '001',
    name: '머신러닝',
    credits: 3,
    professor: '한경수',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성404(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20356',
    division: '002',
    name: '머신러닝',
    credits: 3,
    professor: '한경수',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성404(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '03022',
    division: '001',
    name: '정보보안',
    credits: 3,
    professor: '박미옥',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '성406(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '18264',
    division: '001',
    name: '엔터프라이즈애플리케이션',
    credits: 3,
    professor: '김미연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 13,
        endPeriod: 15
      }
    ],
    location: '성404(컴공)',
    note: '',
    semester: '2025-2',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 정보통신공학과 수업 데이터
const informationCommunicationCourses = [
  {
    grade: 1,
    category: '전공필수',
    code: '18241',
    division: '001',
    name: '공학설계입문',
    credits: 3,
    professor: '김인겸',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성207(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18241',
    division: '002',
    name: '공학설계입문',
    credits: 3,
    professor: '김인겸',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공필수',
    code: '18241',
    division: '003',
    name: '공학설계입문',
    credits: 3,
    professor: '김인겸',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21648',
    division: '001',
    name: '정보통신수학',
    credits: 3,
    professor: '문형진',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성202(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21648',
    division: '002',
    name: '정보통신수학',
    credits: 3,
    professor: '문형진',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성202(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '01331',
    division: '001',
    name: '객체지향프로그래밍',
    credits: 3,
    professor: '이광수',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '01331',
    division: '002',
    name: '객체지향프로그래밍',
    credits: 3,
    professor: '이광수',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '21647',
    division: '001',
    name: '컴퓨터네트워킹',
    credits: 3,
    professor: '김도규',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성201(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '21647',
    division: '002',
    name: '컴퓨터네트워킹',
    credits: 3,
    professor: '김도규',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성201(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01630',
    division: '001',
    name: '웹프로그래밍',
    credits: 3,
    professor: '정복래',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01630',
    division: '002',
    name: '웹프로그래밍',
    credits: 3,
    professor: '정복래',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01688',
    division: '001',
    name: '리눅스',
    credits: 3,
    professor: '김영호',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성207(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01688',
    division: '002',
    name: '리눅스',
    credits: 3,
    professor: '김영호',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성207(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '06118',
    division: '001',
    name: '논리회로실습',
    credits: 3,
    professor: '이재철',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성207(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '06118',
    division: '002',
    name: '논리회로실습',
    credits: 3,
    professor: '이재철',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성207(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18265',
    division: '001',
    name: '전자회로설계',
    credits: 3,
    professor: '윤기호',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성207(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18265',
    division: '002',
    name: '전자회로설계',
    credits: 3,
    professor: '윤기호',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성207(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20987',
    division: '012',
    name: '진로와취창업',
    credits: 2,
    professor: '박찬욱',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20987',
    division: '016',
    name: '진로와취창업',
    credits: 2,
    professor: '박찬욱',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '012',
    name: '진로탐색(2)(SolMate)',
    credits: 3,
    professor: '정복래',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 10,
        endPeriod: 15
      }
    ],
    location: '성201(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '014',
    name: '진로탐색(2)(취업진로 탐색)',
    credits: 3,
    professor: '정복래',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '성201(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '025',
    name: '진로탐색(2)(IT 주요기업 탐색)',
    credits: 3,
    professor: '김용규',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 10,
        endPeriod: 15
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '026',
    name: '진로탐색(2)(택배도난방지 스마트보관함)',
    credits: 3,
    professor: '김용규',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '20894',
    division: '001',
    name: '종합설계기획',
    credits: 1,
    professor: '김인겸',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '20894',
    division: '002',
    name: '종합설계기획',
    credits: 1,
    professor: '정복래',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '성201(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01728',
    division: '001',
    name: '영상처리',
    credits: 3,
    professor: '김인겸',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성207(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18242',
    division: '001',
    name: '무선공학',
    credits: 3,
    professor: '윤기호',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20468',
    division: '001',
    name: 'IoT실습과응용',
    credits: 3,
    professor: '정복래',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성201(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20468',
    division: '002',
    name: 'IoT실습과응용',
    credits: 3,
    professor: '정복래',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성201(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20895',
    division: '001',
    name: '블록체인(1)',
    credits: 3,
    professor: '김도규',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성B102(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20896',
    division: '001',
    name: '디지털시스템실습',
    credits: 3,
    professor: '김용규',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성201(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20896',
    division: '002',
    name: '디지털시스템실습',
    credits: 3,
    professor: '김용규',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성201(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공필수',
    code: '20897',
    division: '001',
    name: '종합설계관리',
    credits: 1,
    professor: '박찬욱',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공필수',
    code: '20897',
    division: '002',
    name: '종합설계관리',
    credits: 1,
    professor: '박찬욱',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 10
      }
    ],
    location: '성205(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20892',
    division: '001',
    name: '블록체인(2)',
    credits: 3,
    professor: '김도규',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 13,
        endPeriod: 15
      }
    ],
    location: '성B102(정통)',
    note: '',
    semester: '2025-2',
    department: '정보통신공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 미디어소프트웨어학과 수업 데이터
const mediaSoftwareCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '01350',
    division: '001',
    name: '이산수학',
    credits: 3,
    professor: '정유원',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01350',
    division: '002',
    name: '이산수학',
    credits: 3,
    professor: '정유원',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19815',
    division: '001',
    name: 'C++프로그래밍',
    credits: 3,
    professor: '박성준',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성303(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19815',
    division: '002',
    name: 'C++프로그래밍',
    credits: 3,
    professor: '박성준',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성303(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19816',
    division: '001',
    name: '미디어소프트웨어기초설계',
    credits: 3,
    professor: '허원회',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성303(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19816',
    division: '002',
    name: '미디어소프트웨어기초설계',
    credits: 3,
    professor: '허원회',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성303(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20470',
    division: '003',
    name: '파이썬프로그래밍',
    credits: 3,
    professor: '최호웅',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성304(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20470',
    division: '007',
    name: '파이썬프로그래밍',
    credits: 3,
    professor: '최호웅',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성304(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20934',
    division: '001',
    name: '게임/가상현실콘텐츠기획',
    credits: 3,
    professor: '김정이',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성303(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20934',
    division: '002',
    name: '게임/가상현실콘텐츠기획',
    credits: 3,
    professor: '김정이',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성303(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '01605',
    division: '002',
    name: '데이터베이스',
    credits: 3,
    professor: '박경숙',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '01605',
    division: '005',
    name: '데이터베이스',
    credits: 3,
    professor: '박경숙',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '01728',
    division: '002',
    name: '영상처리',
    credits: 3,
    professor: '허원회',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성303(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '01728',
    division: '003',
    name: '영상처리',
    credits: 3,
    professor: '허원회',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성303(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '20941',
    division: '001',
    name: '앱프로그래밍(1)',
    credits: 3,
    professor: '박혜진',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '20941',
    division: '002',
    name: '앱프로그래밍(1)',
    credits: 3,
    professor: '박혜진',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19818',
    division: '001',
    name: '자바웹프로그래밍(2)',
    credits: 3,
    professor: '최도현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19818',
    division: '002',
    name: '자바웹프로그래밍(2)',
    credits: 3,
    professor: '최도현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20987',
    division: '013',
    name: '진로와취창업',
    credits: 2,
    professor: '허원회',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '성307(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20987',
    division: '014',
    name: '진로와취창업',
    credits: 2,
    professor: '허원회',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '성307(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '17958',
    division: '001',
    name: 'HCI',
    credits: 3,
    professor: '김정이',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성307(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '17958',
    division: '002',
    name: 'HCI',
    credits: 3,
    professor: '김정이',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성307(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '17958',
    division: '003',
    name: 'HCI',
    credits: 3,
    professor: '김정이',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성307(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '19819',
    division: '001',
    name: '미디어소프트웨어종합설계(1)',
    credits: 3,
    professor: '박성준',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성303(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '19819',
    division: '002',
    name: '미디어소프트웨어종합설계(1)',
    credits: 3,
    professor: '허원회',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '19819',
    division: '003',
    name: '미디어소프트웨어종합설계(1)',
    credits: 3,
    professor: '김정이',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성307(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01309',
    division: '001',
    name: '인공지능',
    credits: 3,
    professor: '문석재',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01309',
    division: '002',
    name: '인공지능',
    credits: 3,
    professor: '문석재',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성305(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20938',
    division: '001',
    name: '게임엔진(2)',
    credits: 3,
    professor: '박성준',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '성304(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20938',
    division: '002',
    name: '게임엔진(2)',
    credits: 3,
    professor: '박성준',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성304(미소)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20940',
    division: '001',
    name: '취창업세미나',
    credits: 3,
    professor: '안병후',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '성B101(산경)',
    note: '',
    semester: '2025-2',
    department: '미디어소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 도시디자인정보공학과 수업 데이터
const urbanDesignCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '19946',
    division: '001',
    name: '국토및지역계획',
    credits: 3,
    professor: '한홍구',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중405(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19947',
    division: '001',
    name: '도시디자인의이해',
    credits: 3,
    professor: '김수재',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중408(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20056',
    division: '001',
    name: '도시의이해',
    credits: 3,
    professor: '조우현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중207',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20062',
    division: '001',
    name: '지구계획스튜디오',
    credits: 3,
    professor: '김수재',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중408(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20063',
    division: '001',
    name: '도시방재론',
    credits: 3,
    professor: '정동선',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중207',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20064',
    division: '001',
    name: '컴퓨터설계',
    credits: 3,
    professor: '김수재',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중408(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20065',
    division: '001',
    name: '통계분석',
    credits: 3,
    professor: '김수재',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중408(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20066',
    division: '001',
    name: '스마트도시론',
    credits: 3,
    professor: '한홍구',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중405(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21411',
    division: '028',
    name: '진로탐색(2)',
    credits: 3,
    professor: '김수재',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '중405(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19962',
    division: '001',
    name: '3D공간설계',
    credits: 3,
    professor: '김동현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중408(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20071',
    division: '001',
    name: '토지이용 이론 및 실습',
    credits: 3,
    professor: '문채',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중206',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20072',
    division: '001',
    name: '도시개발 이론 및 실무',
    credits: 3,
    professor: '문채',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중206',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20083',
    division: '001',
    name: '지리정보체계론 심화',
    credits: 3,
    professor: '이동우',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중408(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공필수',
    code: '20055',
    division: '001',
    name: '종합설계',
    credits: 3,
    professor: '이범현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중405(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19972',
    division: '001',
    name: '도시설계론',
    credits: 3,
    professor: '유창형',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중207',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20078',
    division: '001',
    name: '공간계획제도 이해(학생제안과목)',
    credits: 3,
    professor: '이범현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중207',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20079',
    division: '001',
    name: '외부공간설계론',
    credits: 3,
    professor: '오은열',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중408(도디실습실)',
    note: '',
    semester: '2025-2',
    department: '도시디자인정보공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 음악학부 수업 데이터
const musicDepartmentCourses = [
  {
    grade: 1,
    category: '전공필수',
    code: '19978',
    division: '001',
    name: '연주실습(2)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01448',
    division: '001',
    name: '화성학(1)',
    credits: 2,
    professor: 'HWANG SO MYUNG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '기308',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '18474',
    division: '001',
    name: '실기클래스(2)',
    credits: 1,
    professor: '김기량',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기261호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '19980',
    division: '001',
    name: '연주실습(4)',
    credits: 1,
    professor: '김동현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01547',
    division: '001',
    name: '합창(2)',
    credits: 1,
    professor: '정현혜',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18510',
    division: '001',
    name: '실기클래스(4)',
    credits: 1,
    professor: '김기량',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '기261호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18510',
    division: '002',
    name: '실기클래스(4)',
    credits: 1,
    professor: '이승연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '기307',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18510',
    division: '003',
    name: '실기클래스(4)',
    credits: 1,
    professor: '신창식',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '기307',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20482',
    division: '001',
    name: '전공영어(2)',
    credits: 3,
    professor: 'KYE BONG WON',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기308',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20987',
    division: '007',
    name: '진로와취창업',
    credits: 2,
    professor: '김동현',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기308',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01549',
    division: '001',
    name: '합창(4)',
    credits: 1,
    professor: '정현혜',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01577',
    division: '001',
    name: '서양음악사(3)',
    credits: 2,
    professor: '이주희',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기309',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19982',
    division: '001',
    name: '연주실습(6)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20483',
    division: '001',
    name: '전통음악의이해',
    credits: 2,
    professor: '권정구',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 9,
        endPeriod: 10
      }
    ],
    location: '기309',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20905',
    division: '001',
    name: '캡스톤디자인(1)',
    credits: 3,
    professor: '김지만',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기307',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01551',
    division: '001',
    name: '합창(6)',
    credits: 1,
    professor: '정현혜',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01475',
    division: '001',
    name: '독어딕션',
    credits: 2,
    professor: '김동현',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '기309',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '17902',
    division: '001',
    name: '성악의이해(2)',
    credits: 2,
    professor: '김동현',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '기308',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21517',
    division: '001',
    name: '시창청음성악(심화)',
    credits: 2,
    professor: 'KWAK HYUNJOO RACHEL',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '기308',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01479',
    division: '001',
    name: '불어딕션',
    credits: 2,
    professor: '김동현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01492',
    division: '001',
    name: '영어딕션',
    credits: 2,
    professor: 'KWAK HYUNJOO RACHEL',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20928',
    division: '001',
    name: '성악 전공실기(6)',
    credits: 1,
    professor: '김동현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기념관 2층 238호 교수연구실(김동현)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21087',
    division: '001',
    name: '오페라 워크샵(2)',
    credits: 2,
    professor: 'KWAK HYUNJOO RACHEL',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01496',
    division: '001',
    name: '성악교수법',
    credits: 2,
    professor: 'KYE BONG WON',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기307',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01596',
    division: '001',
    name: '한국가곡',
    credits: 2,
    professor: '김동현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20930',
    division: '001',
    name: '성악 전공실기(8)',
    credits: 1,
    professor: '김동현',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기념관 2층 238호 교수연구실(김동현)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20930',
    division: '002',
    name: '성악 전공실기(8)',
    credits: 1,
    professor: 'KWAK HYUNJOO RACHEL',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기263호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20930',
    division: '003',
    name: '성악 전공실기(8)',
    credits: 1,
    professor: 'KWAK HYUNJOO RACHEL',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기263호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20930',
    division: '004',
    name: '성악 전공실기(8)',
    credits: 1,
    professor: 'KYE BONG WON',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기243',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20931',
    division: '001',
    name: '성악 세미나(2)',
    credits: 1,
    professor: '김동현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '19988',
    division: '001',
    name: '피아노기초이론(2)',
    credits: 2,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '기309',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20917',
    division: '001',
    name: '피아노 전공실기(2)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기237호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20917',
    division: '002',
    name: '피아노 전공실기(2)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기237호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20917',
    division: '003',
    name: '피아노 전공실기(2)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기237호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20917',
    division: '004',
    name: '피아노 전공실기(2)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기237호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20917',
    division: '005',
    name: '피아노 전공실기(2)',
    credits: 1,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기264호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20917',
    division: '006',
    name: '피아노 전공실기(2)',
    credits: 1,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기264호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20917',
    division: '007',
    name: '피아노 전공실기(2)',
    credits: 1,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기264호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20917',
    division: '008',
    name: '피아노 전공실기(2)',
    credits: 1,
    professor: 'HWANG SO MYUNG',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21516',
    division: '001',
    name: '시창청음피아노(심화)',
    credits: 2,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '기309',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01570',
    division: '001',
    name: '피아노반주실습(2)',
    credits: 2,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20474',
    division: '001',
    name: '피아노연주기법',
    credits: 2,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20475',
    division: '001',
    name: '실용피아노연주',
    credits: 2,
    professor: '박상현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기210호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '001',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기237호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '002',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기237호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '003',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기264호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '004',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: 'YUH KYONGEUN KRISTY',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기260호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '005',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: 'YUH KYONGEUN KRISTY',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기260호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '006',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: 'YUH KYONGEUN KRISTY',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기260호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '007',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: 'YUH KYONGEUN KRISTY',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기260호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '008',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: 'HWANG SO MYUNG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '009',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: 'HWANG SO MYUNG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '010',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: '이주희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '011',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: '이주희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '012',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: '김정휘',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기262호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '013',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: '김정휘',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기262호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '014',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: '김정휘',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기262호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20919',
    division: '015',
    name: '피아노 전공실기(4)',
    credits: 1,
    professor: '한지현',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21498',
    division: '001',
    name: '유아피아노티칭',
    credits: 2,
    professor: '김명희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기210호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01438',
    division: '001',
    name: '지휘법(2)',
    credits: 2,
    professor: '박진우',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01566',
    division: '001',
    name: '피아노앙상블(2)',
    credits: 2,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18518',
    division: '001',
    name: '고전피아노음악(원격수업)',
    credits: 2,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기309',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19577',
    division: '001',
    name: '20세기피아노음악(학생제안과목)',
    credits: 2,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '기309',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20921',
    division: '001',
    name: '피아노 전공실기(6)',
    credits: 1,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 1
      }
    ],
    location: '기264호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20921',
    division: '002',
    name: '피아노 전공실기(6)',
    credits: 1,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기264호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20921',
    division: '003',
    name: '피아노 전공실기(6)',
    credits: 1,
    professor: 'YUH KYONGEUN KRISTY',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기260호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20921',
    division: '004',
    name: '피아노 전공실기(6)',
    credits: 1,
    professor: 'HWANG SO MYUNG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20921',
    division: '005',
    name: '피아노 전공실기(6)',
    credits: 1,
    professor: '강소연',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20921',
    division: '006',
    name: '피아노 전공실기(6)',
    credits: 1,
    professor: '김정휘',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기262호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20921',
    division: '007',
    name: '피아노 전공실기(6)',
    credits: 1,
    professor: '한지현',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20921',
    division: '008',
    name: '피아노 전공실기(6)',
    credits: 1,
    professor: '한지현',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21503',
    division: '001',
    name: '글로컬예술기획실습',
    credits: 2,
    professor: '신창식',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '기307',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19798',
    division: '001',
    name: '피아노페다고지실습',
    credits: 2,
    professor: '고화영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기308',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '001',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기237호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '002',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기237호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '003',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: 'NAM HEE JUNG',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기264호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '004',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: 'YUH KYONGEUN KRISTY',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기260호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '005',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: 'YUH KYONGEUN KRISTY',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기260호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '006',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: 'YUH KYONGEUN KRISTY',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기260호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '007',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: 'HWANG SO MYUNG',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '008',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: 'HWANG SO MYUNG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '009',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: '이주희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '010',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: '이주희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '011',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: '이주희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '012',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: '강소연',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '013',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: '강소연',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기258호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20923',
    division: '014',
    name: '피아노 전공실기(8)',
    credits: 1,
    professor: '김정휘',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기262호',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20933',
    division: '001',
    name: '피아노 세미나(2)',
    credits: 1,
    professor: '김수련',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기201(홍대실홀)',
    note: '',
    semester: '2025-2',
    department: '음악학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 실용음악과 수업 데이터
const practicalMusicCourses = [
  {
    grade: 1,
    category: '전공필수',
    code: '21374',
    division: '001',
    name: '위클리 공연실습(2)',
    credits: 1,
    professor: '이창구',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '001',
    name: '전공실기(2)',
    credits: 1,
    professor: '임주연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기213호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '002',
    name: '전공실기(2)',
    credits: 1,
    professor: '김영진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '003',
    name: '전공실기(2)',
    credits: 1,
    professor: '김영진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '004',
    name: '전공실기(2)',
    credits: 1,
    professor: '김영진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '005',
    name: '전공실기(2)',
    credits: 1,
    professor: '임주현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '006',
    name: '전공실기(2)',
    credits: 1,
    professor: '김영진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 10
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '007',
    name: '전공실기(2)',
    credits: 1,
    professor: '이신희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '008',
    name: '전공실기(2)',
    credits: 1,
    professor: '이신희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '009',
    name: '전공실기(2)',
    credits: 1,
    professor: '하형주',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기B101 연습실',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '010',
    name: '전공실기(2)',
    credits: 1,
    professor: '하형주',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기B101 연습실',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '011',
    name: '전공실기(2)',
    credits: 1,
    professor: '하형주',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기B101 연습실',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '012',
    name: '전공실기(2)',
    credits: 1,
    professor: '이성교',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '013',
    name: '전공실기(2)',
    credits: 1,
    professor: '이성교',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '014',
    name: '전공실기(2)',
    credits: 1,
    professor: '이윤상',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기B101 연습실',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '015',
    name: '전공실기(2)',
    credits: 1,
    professor: '허석',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '016',
    name: '전공실기(2)',
    credits: 1,
    professor: '허석',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '018',
    name: '전공실기(2)',
    credits: 1,
    professor: '박상현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 1
      }
    ],
    location: '기213호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '019',
    name: '전공실기(2)',
    credits: 1,
    professor: '박상현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기210호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '020',
    name: '전공실기(2)',
    credits: 1,
    professor: '박상현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기210호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '021',
    name: '전공실기(2)',
    credits: 1,
    professor: '이창구',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기101(렛슨실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '022',
    name: '전공실기(2)',
    credits: 1,
    professor: '엄세현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기213호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '01430',
    division: '023',
    name: '전공실기(2)',
    credits: 1,
    professor: '박희영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기203호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20871',
    division: '001',
    name: '기초화성학',
    credits: 2,
    professor: '엄세현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '기317(컴퓨터음악실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21382',
    division: '001',
    name: '부실기(심화)',
    credits: 2,
    professor: '정희영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21382',
    division: '002',
    name: '부실기(심화)',
    credits: 2,
    professor: '이성교',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21382',
    division: '003',
    name: '부실기(심화)',
    credits: 2,
    professor: '김효식',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 9,
        endPeriod: 10
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21385',
    division: '001',
    name: '라이브퍼포먼스 응용',
    credits: 2,
    professor: '이윤상',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21885',
    division: '001',
    name: '로직프로(심화)',
    credits: 2,
    professor: '이정현',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '기317(컴퓨터음악실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21901',
    division: '001',
    name: '대중음악의장르와스타일',
    credits: 2,
    professor: '권현우',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: 'XR 강의실1(학술1층)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21902',
    division: '001',
    name: '시창청음응용과리듬연구',
    credits: 2,
    professor: '이창구',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '기210호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '22064',
    division: '001',
    name: '실용음악창작워크숍(학생제안과목)',
    credits: 3,
    professor: '임주연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기317(컴퓨터음악실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '21376',
    division: '001',
    name: '위클리 공연실습(4)',
    credits: 1,
    professor: '유현식',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '001',
    name: '전공실기(4)',
    credits: 1,
    professor: '손현정',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 10
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '002',
    name: '전공실기(4)',
    credits: 1,
    professor: '임주현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '003',
    name: '전공실기(4)',
    credits: 1,
    professor: '임주현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '004',
    name: '전공실기(4)',
    credits: 1,
    professor: '박란',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '005',
    name: '전공실기(4)',
    credits: 1,
    professor: '박란',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '006',
    name: '전공실기(4)',
    credits: 1,
    professor: '김영진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '007',
    name: '전공실기(4)',
    credits: 1,
    professor: '김영진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '009',
    name: '전공실기(4)',
    credits: 1,
    professor: '박희영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기203호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '010',
    name: '전공실기(4)',
    credits: 1,
    professor: '이정현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '011',
    name: '전공실기(4)',
    credits: 1,
    professor: '이정현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 10
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '012',
    name: '전공실기(4)',
    credits: 1,
    professor: '이승호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '013',
    name: '전공실기(4)',
    credits: 1,
    professor: '이승호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '014',
    name: '전공실기(4)',
    credits: 1,
    professor: '이윤상',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기B101 연습실',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '015',
    name: '전공실기(4)',
    credits: 1,
    professor: '이윤상',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 1
      }
    ],
    location: '기B101 연습실',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '016',
    name: '전공실기(4)',
    credits: 1,
    professor: '김지희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기213호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '017',
    name: '전공실기(4)',
    credits: 1,
    professor: '김지희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기213호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '019',
    name: '전공실기(4)',
    credits: 1,
    professor: '이선아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '01432',
    division: '020',
    name: '전공실기(4)',
    credits: 1,
    professor: '이선아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20883',
    division: '001',
    name: '작사법',
    credits: 2,
    professor: '이율구',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 9,
        endPeriod: 10
      }
    ],
    location: '기308',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21389',
    division: '001',
    name: 'Pro Tools(심화)',
    credits: 2,
    professor: '차동규',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기317(컴퓨터음악실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21390',
    division: '001',
    name: '편곡과 활용',
    credits: 2,
    professor: '김정민',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '기317(컴퓨터음악실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공필수',
    code: '21378',
    division: '001',
    name: '위클리 공연실습(6)',
    credits: 1,
    professor: '손현정',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '001',
    name: '전공실기(6)',
    credits: 1,
    professor: '임주연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '기213호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '002',
    name: '전공실기(6)',
    credits: 1,
    professor: '임주연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기213호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '003',
    name: '전공실기(6)',
    credits: 1,
    professor: '김종필',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '004',
    name: '전공실기(6)',
    credits: 1,
    professor: '김종필',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '005',
    name: '전공실기(6)',
    credits: 1,
    professor: '김종필',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '007',
    name: '전공실기(6)',
    credits: 1,
    professor: '김우준',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '008',
    name: '전공실기(6)',
    credits: 1,
    professor: '임주현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '009',
    name: '전공실기(6)',
    credits: 1,
    professor: '한찬양',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '010',
    name: '전공실기(6)',
    credits: 1,
    professor: '한찬양',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '011',
    name: '전공실기(6)',
    credits: 1,
    professor: '이신희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '012',
    name: '전공실기(6)',
    credits: 1,
    professor: '이승호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '013',
    name: '전공실기(6)',
    credits: 1,
    professor: '이승호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '014',
    name: '전공실기(6)',
    credits: 1,
    professor: '이승호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '015',
    name: '전공실기(6)',
    credits: 1,
    professor: '김효식',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기213호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '016',
    name: '전공실기(6)',
    credits: 1,
    professor: '하형주',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기B101 연습실',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '017',
    name: '전공실기(6)',
    credits: 1,
    professor: '이윤상',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기B101 연습실',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '018',
    name: '전공실기(6)',
    credits: 1,
    professor: '허석',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '019',
    name: '전공실기(6)',
    credits: 1,
    professor: '김승희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '020',
    name: '전공실기(6)',
    credits: 1,
    professor: '정희영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기106(렛슨실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '021',
    name: '전공실기(6)',
    credits: 1,
    professor: '이선아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '022',
    name: '전공실기(6)',
    credits: 1,
    professor: '이선아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '01434',
    division: '023',
    name: '전공실기(6)',
    credits: 1,
    professor: '전종혁',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20022',
    division: '001',
    name: '영상음악제작',
    credits: 2,
    professor: '유현식',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 9,
        endPeriod: 10
      }
    ],
    location: '기317(컴퓨터음악실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21396',
    division: '001',
    name: 'Background 보컬리스트 기법',
    credits: 2,
    professor: '김종필',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기210호',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21397',
    division: '001',
    name: '세션레코딩실습',
    credits: 2,
    professor: '이정현',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 9,
        endPeriod: 10
      }
    ],
    location: '기317(컴퓨터음악실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21398',
    division: '001',
    name: '장르별워크숍',
    credits: 2,
    professor: '정희영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21399',
    division: '001',
    name: '퍼커션앙상블',
    credits: 2,
    professor: '이창구',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21400',
    division: '001',
    name: '레코딩테크닉',
    credits: 2,
    professor: '차동규',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '기317(컴퓨터음악실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21409',
    division: '001',
    name: '보컬 워크숍',
    credits: 2,
    professor: '이동주',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '기317(컴퓨터음악실)',
    note: '',
    semester: '2025-2',
    department: '실용음악과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 공연음악예술학부 수업 데이터
const performingMusicCourses = [
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '001',
    name: '전공실기(8)',
    credits: 1,
    professor: '손현정',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '002',
    name: '전공실기(8)',
    credits: 1,
    professor: '손현정',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '004',
    name: '전공실기(8)',
    credits: 1,
    professor: '손현정',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '005',
    name: '전공실기(8)',
    credits: 1,
    professor: '오은아',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '006',
    name: '전공실기(8)',
    credits: 1,
    professor: '오은아',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '007',
    name: '전공실기(8)',
    credits: 1,
    professor: '오은아',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '008',
    name: '전공실기(8)',
    credits: 1,
    professor: '임주현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 10
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '009',
    name: '전공실기(8)',
    credits: 1,
    professor: '임주현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 1
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '010',
    name: '전공실기(8)',
    credits: 1,
    professor: '박란',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '011',
    name: '전공실기(8)',
    credits: 1,
    professor: '한찬양',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '012',
    name: '전공실기(8)',
    credits: 1,
    professor: '김효식',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기213호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '013',
    name: '전공실기(8)',
    credits: 1,
    professor: '이윤상',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기B101 연습실',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '014',
    name: '전공실기(8)',
    credits: 1,
    professor: '이윤상',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 8,
        endPeriod: 8
      }
    ],
    location: '기B101 연습실',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '015',
    name: '전공실기(8)',
    credits: 1,
    professor: '김승희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '016',
    name: '전공실기(8)',
    credits: 1,
    professor: '김승희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 10
      }
    ],
    location: '기211호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '018',
    name: '전공실기(8)',
    credits: 1,
    professor: '전종혁',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '기107(앙상블룸)',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '019',
    name: '전공실기(8)',
    credits: 1,
    professor: '박희영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기203호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '020',
    name: '전공실기(8)',
    credits: 1,
    professor: '차동규',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '021',
    name: '전공실기(8)',
    credits: 1,
    professor: '차동규',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '기337(스튜디오실)',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '01436',
    division: '022',
    name: '전공실기(8)',
    credits: 1,
    professor: '김종필',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '기212호',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20906',
    division: '001',
    name: '캡스톤디자인(2)',
    credits: 2,
    professor: '유현식',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '학술201(돌비애트모스스튜디오)',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20985',
    division: '001',
    name: '모던워쉽테크놀로지(2)',
    credits: 3,
    professor: '김효식',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기103(오딧세이21홀)',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20027',
    division: '001',
    name: '세션레코딩실습(2)',
    credits: 2,
    professor: '이성교',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '기317(컴퓨터음악실)',
    note: '',
    semester: '2025-2',
    department: '공연음악예술학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 연기예술학과 수업 데이터
const actingArtsCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '21412',
    division: '001',
    name: '서양연극사',
    credits: 3,
    professor: '나진환',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21415',
    division: '001',
    name: '문화예술 교육개론',
    credits: 2,
    professor: '이원현',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21421',
    division: '001',
    name: '신체훈련실습심화',
    credits: 2,
    professor: '박호빈',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21422',
    division: '001',
    name: '기초연기의 확장',
    credits: 2,
    professor: '최지수',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기407(연기)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21422',
    division: '002',
    name: '기초연기의 확장',
    credits: 2,
    professor: '조하나',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기407(연기)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21417',
    division: '001',
    name: '문화예술교육현장의 이해와실습',
    credits: 2,
    professor: '이원현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21425',
    division: '001',
    name: '중급연기의확대',
    credits: 3,
    professor: '한윤춘',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기407(연기)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21425',
    division: '002',
    name: '중급연기의확대',
    credits: 3,
    professor: '한윤춘',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기407(연기)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21426',
    division: '001',
    name: '창작연극워크샵 심화',
    credits: 3,
    professor: '강경동',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 6,
        endPeriod: 9
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21427',
    division: '001',
    name: '화술심화',
    credits: 3,
    professor: '박윤희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21427',
    division: '002',
    name: '화술심화',
    credits: 3,
    professor: '박윤희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21428',
    division: '001',
    name: '무대공간제작실습심화',
    credits: 2,
    professor: '김동경',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '06025',
    division: '001',
    name: '뮤지컬과대중문화',
    credits: 3,
    professor: '이원현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21414',
    division: '001',
    name: '뮤지컬 공연제작',
    credits: 3,
    professor: '김찬',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 6,
        endPeriod: 9
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21419',
    division: '001',
    name: '연극교육프로그램개발',
    credits: 2,
    professor: '함현경',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 3
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21432',
    division: '001',
    name: '뮤지컬 가창실습 심화',
    credits: 3,
    professor: '이소유',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기407(연기)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21432',
    division: '002',
    name: '뮤지컬 가창실습 심화',
    credits: 3,
    professor: '이소유',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기407(연기)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21433',
    division: '001',
    name: '카메라연기 심화',
    credits: 2,
    professor: '김형준',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21433',
    division: '002',
    name: '카메라연기 심화',
    credits: 2,
    professor: '김형준',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21434',
    division: '001',
    name: '뮤지컬 댄스 심화',
    credits: 2,
    professor: '장서현',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기407(연기)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21435',
    division: '001',
    name: '현대무대움직임연구 심화',
    credits: 2,
    professor: '박호빈',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21436',
    division: '001',
    name: '뮤지컬공연제작 가창',
    credits: 2,
    professor: '이소유',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '22062',
    division: '001',
    name: '유라시아국제연극프로덕션(학생제안과목)',
    credits: 3,
    professor: '나진환',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '22062',
    division: '002',
    name: '유라시아국제연극프로덕션(학생제안과목)',
    credits: 3,
    professor: '강경동',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연기예술학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 영화영상학과 수업 데이터
const filmVideoCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '21307',
    division: '001',
    name: '고전읽기 심화',
    credits: 3,
    professor: '정현아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21307',
    division: '002',
    name: '고전읽기 심화',
    credits: 3,
    professor: '정현아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21308',
    division: '001',
    name: '역사로영화읽기',
    credits: 3,
    professor: '이대범',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21309',
    division: '001',
    name: '영상기호와영상스토리텔링',
    credits: 3,
    professor: '황경현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21310',
    division: '001',
    name: '나와영화',
    credits: 3,
    professor: '송예진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21310',
    division: '002',
    name: '나와영화',
    credits: 3,
    professor: '송예진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21314',
    division: '001',
    name: '심리학으로영화읽기',
    credits: 3,
    professor: '이대범',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21315',
    division: '001',
    name: '작가스타일과표현분석',
    credits: 3,
    professor: '김찬희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21316',
    division: '001',
    name: '촬영조명심화',
    credits: 3,
    professor: '황경현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 5
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21317',
    division: '001',
    name: '시청각적글쓰기(압축,상징,은유)',
    credits: 3,
    professor: '심수경',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21317',
    division: '002',
    name: '시청각적글쓰기(압축,상징,은유)',
    credits: 3,
    professor: '심수경',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영111',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21318',
    division: '001',
    name: '세트제작워크숍(5분영화만들기)',
    credits: 3,
    professor: '이미랑',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 8
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21318',
    division: '002',
    name: '세트제작워크숍(5분영화만들기)',
    credits: 3,
    professor: '송예진',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 8
      }
    ],
    location: '재508호 강의실',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21323',
    division: '001',
    name: '영화역사',
    credits: 3,
    professor: '정민아',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중309',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21324',
    division: '001',
    name: '액팅포디렉팅 심화',
    credits: 3,
    professor: '배정화',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기321(캡스톤실습실)',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21324',
    division: '002',
    name: '액팅포디렉팅 심화',
    credits: 3,
    professor: '배정화',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기321(캡스톤실습실)',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21325',
    division: '001',
    name: '프로덕션 심화 (비주얼랭귀지)',
    credits: 3,
    professor: '류훈',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 10
      }
    ],
    location: '기321(캡스톤실습실)',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21326',
    division: '001',
    name: '프로덕션 심화 (사운드랭귀지)',
    credits: 3,
    professor: '류훈',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기321(캡스톤실습실)',
    note: '',
    semester: '2025-2',
    department: '영화영상학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 연극영화학부 수업 데이터
const theaterFilmCourses = [
  {
    grade: 4,
    category: '전공선택',
    code: '21119',
    division: '001',
    name: '인문학과 예술경영',
    credits: 3,
    professor: '나진환',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기320',
    note: '',
    semester: '2025-2',
    department: '연극영화학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '18170',
    division: '001',
    name: '공연제작프로젝트(2)',
    credits: 3,
    professor: '나진환',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 6,
        endPeriod: 9
      }
    ],
    location: '기301(대학극장)',
    note: '',
    semester: '2025-2',
    department: '연극영화학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19829',
    division: '001',
    name: '단편영화제작(4)',
    credits: 3,
    professor: '류훈',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 5
      }
    ],
    location: '기331(편집강의실)',
    note: '',
    semester: '2025-2',
    department: '연극영화학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19829',
    division: '002',
    name: '단편영화제작(4)',
    credits: 3,
    professor: '송예진',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 6,
        endPeriod: 9
      }
    ],
    location: '기331(편집강의실)',
    note: '',
    semester: '2025-2',
    department: '연극영화학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20788',
    division: '001',
    name: '프로듀싱과장편시나리오',
    credits: 3,
    professor: '김찬희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기321(캡스톤실습실)',
    note: '',
    semester: '2025-2',
    department: '연극영화학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 뷰티디자인학과 수업 데이터
const beautyDesignCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '18479',
    division: '001',
    name: '뷰티메이크업',
    credits: 3,
    professor: '표연수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기406(뷰티실습실-메이크업)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '18479',
    division: '002',
    name: '뷰티메이크업(집중수업_전반기)',
    credits: 3,
    professor: '김종원',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 12
      }
    ],
    location: '기406(뷰티실습실-메이크업)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '18480',
    division: '001',
    name: '웨딩업스타일디자인(집중수업_전반기)',
    credits: 3,
    professor: '유유정',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '기402(뷰티실습실-헤어)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '18480',
    division: '002',
    name: '웨딩업스타일디자인(집중수업_하반기)',
    credits: 3,
    professor: '유유정',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '기402(뷰티실습실-헤어)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20715',
    division: '001',
    name: '기초에스테틱',
    credits: 3,
    professor: '전해정',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기401(뷰티실습실-피부)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20715',
    division: '002',
    name: '기초에스테틱',
    credits: 3,
    professor: '전해정',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기401(뷰티실습실-피부)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18484',
    division: '001',
    name: '아트메이크업(집중수업_전반기)',
    credits: 3,
    professor: '전연숙',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '기406(뷰티실습실-메이크업)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '18484',
    division: '002',
    name: '아트메이크업(집중수업_하반기)',
    credits: 3,
    professor: '전연숙',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 6
      }
    ],
    location: '기406(뷰티실습실-메이크업)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19672',
    division: '001',
    name: '헤어실무',
    credits: 3,
    professor: '이서희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기402(뷰티실습실-헤어)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '19672',
    division: '002',
    name: '헤어실무',
    credits: 3,
    professor: '하성이',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기402(뷰티실습실-헤어)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20716',
    division: '001',
    name: '에스테틱기기관리',
    credits: 3,
    professor: '이재은',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기401(뷰티실습실-피부)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20716',
    division: '002',
    name: '에스테틱기기관리',
    credits: 3,
    professor: '이재은',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기401(뷰티실습실-피부)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21440',
    division: '001',
    name: '네일테크닉',
    credits: 3,
    professor: '이종숙',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기406(뷰티실습실-메이크업)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21440',
    division: '002',
    name: '네일테크닉',
    credits: 3,
    professor: '이종숙',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기406(뷰티실습실-메이크업)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '07501',
    division: '001',
    name: '화장품학',
    credits: 3,
    professor: '이종숙',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기402(뷰티실습실-헤어)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18488',
    division: '001',
    name: '뷰티문화사',
    credits: 3,
    professor: '이종숙',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기402(뷰티실습실-헤어)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '18489',
    division: '001',
    name: '뷰티연구세미나',
    credits: 3,
    professor: '전연숙',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기406(뷰티실습실-메이크업)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19675',
    division: '001',
    name: '뷰티위생학',
    credits: 3,
    professor: '임주하',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기402(뷰티실습실-헤어)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19679',
    division: '001',
    name: '헤어살롱컷',
    credits: 3,
    professor: '유유정',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기402(뷰티실습실-헤어)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '07496',
    division: '001',
    name: '에스테틱실무세미나',
    credits: 3,
    professor: '임주하',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기401(뷰티실습실-피부)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '18495',
    division: '001',
    name: '뷰티실무세미나',
    credits: 3,
    professor: '최진은',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기406(뷰티실습실-메이크업)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '19683',
    division: '001',
    name: '헤어실무세미나',
    credits: 3,
    professor: '김수연',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기402(뷰티실습실-헤어)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '21784',
    division: '002',
    name: '현장실습(4-2)',
    credits: 12,
    professor: '최진은',
    schedule: [
      {
        dayOfWeek: 6, // 토요일
        startPeriod: 1,
        endPeriod: 12
      }
    ],
    location: '기406(뷰티실습실-메이크업)',
    note: '',
    semester: '2025-2',
    department: '뷰티디자인학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 융합학부 수업 데이터
const convergenceStudiesCourses = [
  {
    grade: 1,
    category: '전공선택',
    code: '20144',
    division: '001',
    name: '미디어사운드디자인기초',
    credits: 3,
    professor: '권현우',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '학술202(SKU 메타버스 강의실)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20199',
    division: '003',
    name: '미디어와 현대사회',
    credits: 3,
    professor: '김기윤',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20603',
    division: '001',
    name: 'VR드론활용실습',
    credits: 3,
    professor: '강선호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: 'XR 강의실1(학술1층)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20603',
    division: '002',
    name: 'VR드론활용실습',
    credits: 3,
    professor: '강선호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: 'XR 강의실1(학술1층)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21101',
    division: '002',
    name: '메타버스 서비스 기획',
    credits: 3,
    professor: '박상희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '학술202(SKU 메타버스 강의실)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21709',
    division: '001',
    name: '모션캡쳐실습',
    credits: 3,
    professor: '김명길',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '학술202(SKU 메타버스 강의실)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21943',
    division: '001',
    name: '생성형AI활용기초',
    credits: 3,
    professor: '권종수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '학술202(SKU 메타버스 강의실)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21990',
    division: '001',
    name: '미디어콘텐츠테크놀로지의이해',
    credits: 3,
    professor: '김기윤',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '학술203(강의공간)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20472',
    division: '001',
    name: '멀티미디어프로그래밍',
    credits: 3,
    professor: '권현우',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: 'XR 강의실2(학술3층)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21155',
    division: '001',
    name: '디지털 미디어 포스트 프로덕션',
    credits: 3,
    professor: '손다솜',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '학술202(SKU 메타버스 강의실)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21158',
    division: '001',
    name: '유니티 심화',
    credits: 3,
    professor: '김명길',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '학술202(SKU메타버스 강의실)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '17963',
    division: '001',
    name: '3D모델링',
    credits: 3,
    professor: '하주영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: 'XR 강의실2(학술3층)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20373',
    division: '001',
    name: '3D콘텐츠제작실습',
    credits: 3,
    professor: '하주영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: 'XR 강의실2(학술3층)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20993',
    division: '001',
    name: '디지털미디어 정책론',
    credits: 3,
    professor: '김기윤',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: 'XR 강의실1(학술1층)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20994',
    division: '001',
    name: '실감콘텐츠를 위한 사운드와음악',
    credits: 3,
    professor: '천민경',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: 'XR 강의실2(학술3층)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '21160',
    division: '001',
    name: '언리얼 심화',
    credits: 3,
    professor: '이완구',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '학술202(SKU 메타버스 강의실)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20370',
    division: '001',
    name: '1인미디어제작워크숍(2)',
    credits: 3,
    professor: '안준헌',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '학술202(SKU 메타버스 강의실)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20746',
    division: '001',
    name: '피부노화학',
    credits: 3,
    professor: '최여진',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '학술302(강의공간)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21164',
    division: '001',
    name: '바이오 인체 생리학',
    credits: 3,
    professor: '장민아',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '학술302(강의공간)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21532',
    division: '001',
    name: '화장품산업과법규의이해',
    credits: 3,
    professor: '최여진',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '학술302(강의공간)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공필수',
    code: '20749',
    division: '001',
    name: '화장품성분학',
    credits: 3,
    professor: '이정민',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '재408호',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21166',
    division: '001',
    name: '글로벌 화장품 산업 연구',
    credits: 3,
    professor: '공병철',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '재706호',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21534',
    division: '001',
    name: '화장품기획개발',
    credits: 3,
    professor: '이정민',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '재408호',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '19882',
    division: '001',
    name: '캡스톤디자인',
    credits: 3,
    professor: '김나영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '바이오헬스케어시스템실습실(학술401호)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 3,
    category: '전공선택',
    code: '20395',
    division: '001',
    name: '바이오소재경영마케팅',
    credits: 3,
    professor: '장민아',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '바이오헬스케어시스템실습실(학술401호)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '20754',
    division: '001',
    name: '화장품공정학',
    credits: 3,
    professor: '공병철',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '바이오헬스케어시스템실습실(학술401호)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 4,
    category: '전공선택',
    code: '21169',
    division: '001',
    name: '임상 연구 코디네이터학',
    credits: 3,
    professor: '김나영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '바이오헬스케어시스템실습실(학술401호)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '20205',
    division: '002',
    name: '포스트모던문화읽기',
    credits: 3,
    professor: '이경진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '재501호강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21659',
    division: '002',
    name: '엔터테인먼트산업의이해',
    credits: 3,
    professor: '김기윤',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성B101(산경)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '21992',
    division: '001',
    name: '이미지와창의성',
    credits: 3,
    professor: '이경진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '재501호강의실(대형)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '전공선택',
    code: '22003',
    division: '001',
    name: 'K-콘텐츠분야별전공직업탐구세미나',
    credits: 3,
    professor: '이정현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '학술203(강의공간)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '20228',
    division: '002',
    name: '광고와 커뮤니케이션 전략',
    credits: 3,
    professor: '박상희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성B101(산경)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 2,
    category: '전공선택',
    code: '21750',
    division: '001',
    name: 'K-pop공연의이해',
    credits: 3,
    professor: '황준민',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '재507호 강의실(혁신)',
    note: '',
    semester: '2025-2',
    department: '융합학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 파이데이아학부 수업 데이터
const paideiaStudiesCourses = [
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '001',
    name: '사회봉사',
    credits: 1,
    professor: '송진영',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '002',
    name: '사회봉사',
    credits: 1,
    professor: '송진영',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '003',
    name: '사회봉사',
    credits: 1,
    professor: '송진영',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 5
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '004',
    name: '사회봉사',
    credits: 1,
    professor: '송진영',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '005',
    name: '사회봉사',
    credits: 1,
    professor: '송진영',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 10
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '006',
    name: '사회봉사',
    credits: 1,
    professor: '송진영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '007',
    name: '사회봉사',
    credits: 1,
    professor: '송진영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '008',
    name: '사회봉사',
    credits: 1,
    professor: '송진영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '010',
    name: '사회봉사',
    credits: 1,
    professor: '구성모',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '011',
    name: '사회봉사',
    credits: 1,
    professor: '구성모',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 4
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '012',
    name: '사회봉사',
    credits: 1,
    professor: '구성모',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '013',
    name: '사회봉사',
    credits: 1,
    professor: '구성모',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '014',
    name: '사회봉사',
    credits: 1,
    professor: '구성모',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 9,
        endPeriod: 9
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '00074',
    division: '015',
    name: '사회봉사',
    credits: 1,
    professor: '구성모',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 10
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '001',
    name: '기초글쓰기',
    credits: 2,
    professor: '김학중',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '002',
    name: '기초글쓰기',
    credits: 2,
    professor: '김학중',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '003',
    name: '기초글쓰기',
    credits: 2,
    professor: '김학중',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '004',
    name: '기초글쓰기',
    credits: 2,
    professor: '강정구',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '005',
    name: '기초글쓰기',
    credits: 2,
    professor: '강정구',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '006',
    name: '기초글쓰기',
    credits: 2,
    professor: '이우현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '007',
    name: '기초글쓰기',
    credits: 2,
    professor: '이우현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '008',
    name: '기초글쓰기',
    credits: 2,
    professor: '이우현',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '009',
    name: '기초글쓰기',
    credits: 2,
    professor: '조혜진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '010',
    name: '기초글쓰기',
    credits: 2,
    professor: '조혜진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '011',
    name: '기초글쓰기',
    credits: 2,
    professor: '조혜진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '012',
    name: '기초글쓰기',
    credits: 2,
    professor: '신경수',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '013',
    name: '기초글쓰기',
    credits: 2,
    professor: '권도경',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '014',
    name: '기초글쓰기',
    credits: 2,
    professor: '권도경',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '영501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '015',
    name: '기초글쓰기',
    credits: 2,
    professor: '권현숙',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '016',
    name: '기초글쓰기',
    credits: 2,
    professor: '권현숙',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '19737',
    division: '017',
    name: '기초글쓰기(외국인유학생전용)',
    credits: 2,
    professor: '권현숙',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '001',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'CHANG INSOOK',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '002',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'CHANG INSOOK',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '003',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'CHANG INSOOK',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '004',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'CHANG INSOOK',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '005',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'CHANG INSOOK',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '006',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'KEVIN WAYNE CHAPMAN',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '007',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'KEVIN WAYNE CHAPMAN',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '008',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'KEVIN WAYNE CHAPMAN',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '009',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'KEVIN WAYNE CHAPMAN',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '010',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'KEVIN WAYNE CHAPMAN',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '011',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'CHELLEW ARIK GABE',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '012',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'CHELLEW ARIK GABE',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '013',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'CHELLEW ARIK GABE',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '014',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'CHELLEW ARIK GABE',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '015',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'GOLDSMITH TIMOTHY NICHOLAS',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '016',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'GOLDSMITH TIMOTHY NICHOLAS',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '017',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'GOLDSMITH TIMOTHY NICHOLAS',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '018',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'GOLDSMITH TIMOTHY NICHOLAS',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '019',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'HERNANDEZ ROBERTO',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '020',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'HERNANDEZ ROBERTO',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '021',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'HERNANDEZ ROBERTO',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '022',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'HERNANDEZ ROBERTO',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '023',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'HERNANDEZ ROBERTO',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '024',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'HEWSON KAREN SYLVANA',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '025',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'HEWSON KAREN SYLVANA',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '026',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'HEWSON KAREN SYLVANA',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '027',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'HEWSON KAREN SYLVANA',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '028',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'HWANG SO MYUNG',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '029',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'HWANG SO MYUNG',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '030',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'HWANG SO MYUNG',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '036',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'KIM JAMES CHAE PIL',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '038',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'KYE BONG WON',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '039',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'KYE BONG WON',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '040',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'LASHLEY KEITH ANDRE',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '041',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'LASHLEY KEITH ANDRE',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '042',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'LASHLEY KEITH ANDRE',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '043',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'LASHLEY KEITH ANDRE',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '044',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'LEVEILLE BEAU RICHARD',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '045',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'LEVEILLE BEAU RICHARD',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '046',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'LEVEILLE BEAU RICHARD',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '047',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'LEVEILLE BEAU RICHARD',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '048',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'LEVEILLE BEAU RICHARD',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '049',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'MCGRATH JAMES GERARD',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '050',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'MCGRATH JAMES GERARD',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '051',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'MCGRATH JAMES GERARD',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '052',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'MCGRATH JAMES GERARD',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '053',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'MCGRATH JAMES GERARD',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '054',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'MILLER KEVIN AARON',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '055',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'MILLER KEVIN AARON',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '056',
    name: '영어커뮤니케이션(2)(고급[토익500점이상])',
    credits: 2,
    professor: 'MILLER KEVIN AARON',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '057',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'MILLER KEVIN AARON',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '058',
    name: '영어커뮤니케이션(2)(고급[토익500점이상])',
    credits: 2,
    professor: 'MILLER KEVIN AARON',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '059',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'PETERSEN BRIAN T',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '060',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'PETERSEN BRIAN T',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '061',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'PETERSEN BRIAN T',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '062',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'PETERSEN BRIAN T',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '063',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'POWER NIGEL JAMES',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '064',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'POWER NIGEL JAMES',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '065',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'POWER NIGEL JAMES',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '066',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'POWER NIGEL JAMES',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '067',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'POWER NIGEL JAMES',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '068',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ANNE MARIE POWLESS',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '069',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ANNE MARIE POWLESS',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '070',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ANNE MARIE POWLESS',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '071',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ANNE MARIE POWLESS',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '072',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ANNE MARIE POWLESS',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '073',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ROBERTS MICHAEL PATRICK',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '074',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ROBERTS MICHAEL PATRICK',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '075',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'ROBERTS MICHAEL PATRICK',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '076',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ROBERTS MICHAEL PATRICK',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '077',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'ROBERTS MICHAEL PATRICK',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '078',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'TAYLOR DAVID WILSON',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '079',
    name: '영어커뮤니케이션(2)(고급[토익500점이상])',
    credits: 2,
    professor: 'TAYLOR DAVID WILSON',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중403(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '080',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'TAYLOR DAVID WILSON',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '081',
    name: '영어커뮤니케이션(2)(외국인유학생전용)',
    credits: 2,
    professor: 'TAYLOR DAVID WILSON',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '082',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'TAYLOR DAVID WILSON',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '083',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'WATSON ROBERT MATTHEW JAMES',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '084',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'WATSON ROBERT MATTHEW JAMES',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '085',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'WATSON ROBERT MATTHEW JAMES',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '086',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'WATSON ROBERT MATTHEW JAMES',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '087',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'WATSON ROBERT MATTHEW JAMES',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '088',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'YON EUNJI ANGELLA',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '089',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'YON EUNJI ANGELLA',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '090',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'YON EUNJI ANGELLA',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '091',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'YON EUNJI ANGELLA',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '092',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'YON EUNJI ANGELLA',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '093',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'YUH KYONGEUN KRISTY',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '094',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'YUH KYONGEUN KRISTY',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '095',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'YUN PETER ILWOONG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '096',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'YUN PETER ILWOONG',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '097',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'YUN PETER ILWOONG',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '098',
    name: '영어커뮤니케이션(2)(중급[토익350점이상500점이하])',
    credits: 2,
    professor: 'YUN PETER ILWOONG',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '099',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ZUNGU NKANYISO SIBONGISENI',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '100',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ZUNGU NKANYISO SIBONGISENI',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '101',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ZUNGU NKANYISO SIBONGISENI',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '102',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ZUNGU NKANYISO SIBONGISENI',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '103',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: 'ZUNGU NKANYISO SIBONGISENI',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '104',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: '이은주',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '105',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: '이은주',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '106',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: '이은주',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20165',
    division: '107',
    name: '영어커뮤니케이션(2)(초급[토익350점이하])',
    credits: 2,
    professor: '이은주',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '001',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '김보경',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '002',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '김보경',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '003',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '김보경',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '004',
    name: '컴퓨팅사고와 코딩기초(원격수업)',
    credits: 2,
    professor: '박중오',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 5
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '005',
    name: '컴퓨팅사고와 코딩기초(원격수업)',
    credits: 2,
    professor: '박중오',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 6,
        endPeriod: 7
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '006',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '박중오',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 8,
        endPeriod: 9
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '007',
    name: '컴퓨팅사고와 코딩기초(원격수업)',
    credits: 2,
    professor: '박중오',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 11
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '008',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '안두헌',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '009',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '안두헌',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '010',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '안두헌',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '011',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '박중오',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '중104(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '012',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '임순빈',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 2
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '013',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '임순빈',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 3,
        endPeriod: 4
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '20956',
    division: '014',
    name: '컴퓨팅사고와 코딩기초',
    credits: 2,
    professor: '임순빈',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 5,
        endPeriod: 6
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '001',
    name: '신앙으로의초대(원격수업)',
    credits: 3,
    professor: '전요섭',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '002',
    name: '신앙으로의초대',
    credits: 3,
    professor: '김원태',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '003',
    name: '신앙으로의초대',
    credits: 3,
    professor: '김원태',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '004',
    name: '신앙으로의초대',
    credits: 3,
    professor: '이찬호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '005',
    name: '신앙으로의초대',
    credits: 3,
    professor: '이찬호',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '006',
    name: '신앙으로의초대',
    credits: 3,
    professor: '전요섭',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '007',
    name: '신앙으로의초대',
    credits: 3,
    professor: '이강춘',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '008',
    name: '신앙으로의초대(신학과)',
    credits: 3,
    professor: '김성목',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '009',
    name: '신앙으로의초대',
    credits: 3,
    professor: '이주용',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '010',
    name: '신앙으로의초대(기독교교육상담학과)',
    credits: 3,
    professor: '강정규',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '011',
    name: '신앙으로의초대',
    credits: 3,
    professor: '이주용',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '012',
    name: '신앙으로의초대',
    credits: 3,
    professor: '안오식',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '013',
    name: '신앙으로의초대',
    credits: 3,
    professor: '안오식',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '014',
    name: '신앙으로의초대',
    credits: 3,
    professor: '장동신',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '015',
    name: '신앙으로의초대',
    credits: 3,
    professor: '장동신',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '016',
    name: '신앙으로의초대',
    credits: 3,
    professor: '강안일',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '017',
    name: '신앙으로의초대',
    credits: 3,
    professor: '강안일',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '018',
    name: '신앙으로의초대',
    credits: 3,
    professor: '송영만',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '019',
    name: '신앙으로의초대',
    credits: 3,
    professor: '송영만',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '020',
    name: '신앙으로의초대',
    credits: 3,
    professor: '이승용',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '021',
    name: '신앙으로의초대',
    credits: 3,
    professor: '황성환',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '022',
    name: '신앙으로의초대',
    credits: 3,
    professor: '황성환',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '023',
    name: '신앙으로의초대',
    credits: 3,
    professor: '유병철',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '024',
    name: '신앙으로의초대',
    credits: 3,
    professor: '유병철',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '025',
    name: '신앙으로의초대(외국인유학생전용)',
    credits: 3,
    professor: '박정식',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '026',
    name: '신앙으로의초대',
    credits: 3,
    professor: '박정식',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양필수',
    code: '21652',
    division: '027',
    name: '신앙으로의초대',
    credits: 3,
    professor: '이수환',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00046',
    division: '001',
    name: '채플(일반대학2-4학년)',
    credits: 0,
    professor: '',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00046',
    division: '002',
    name: '채플(일반대학2-4학년)',
    credits: 0,
    professor: '',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 6,
        endPeriod: 6
      }
    ],
    location: '기501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00046',
    division: '003',
    name: '채플(일반대학2-4학년)',
    credits: 0,
    professor: '',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '기501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00046',
    division: '004',
    name: '채플(신학대학2-4학년)',
    credits: 0,
    professor: '',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 8
      }
    ],
    location: '기501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00179',
    division: '001',
    name: '동양철학의이해',
    credits: 3,
    professor: '황은영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기315',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00197',
    division: '001',
    name: '서양근대사의이해',
    credits: 3,
    professor: '이규철',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00226',
    division: '001',
    name: '현대사회와범죄',
    credits: 3,
    professor: '김성곤',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00226',
    division: '002',
    name: '현대사회와범죄',
    credits: 3,
    professor: '김성곤',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00230',
    division: '001',
    name: '스포츠와건강관리',
    credits: 3,
    professor: '박규리',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00230',
    division: '002',
    name: '스포츠와건강관리',
    credits: 3,
    professor: '양성지',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '02513',
    division: '001',
    name: '배드민턴',
    credits: 3,
    professor: '김상태',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '02513',
    division: '002',
    name: '배드민턴',
    credits: 3,
    professor: '홍석호',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '02522',
    division: '002',
    name: '스키(집중수업,학교밖수업)',
    credits: 3,
    professor: '안완식',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '02522',
    division: '003',
    name: '스키(집중수업,학교밖수업)',
    credits: 3,
    professor: '허철무',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '17991',
    division: '001',
    name: '리더십과커뮤니케이션',
    credits: 3,
    professor: '한홍근',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18111',
    division: '001',
    name: '비즈니스영어',
    credits: 3,
    professor: 'GOLEMB DANIEL ROGER',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18278',
    division: '001',
    name: '실용영어문법(초급[토익350점이하])',
    credits: 3,
    professor: '표시연',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18278',
    division: '002',
    name: '실용영어문법(초급[토익350점이하])',
    credits: 3,
    professor: 'HEWSON KAREN SYLVANA',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18278',
    division: '003',
    name: '실용영어문법(초급[토익350점이하])',
    credits: 3,
    professor: 'HEWSON KAREN SYLVANA',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18278',
    division: '004',
    name: '실용영어문법(중급[토익350점이상500점이하])',
    credits: 3,
    professor: 'PETERSEN BRIAN T',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18278',
    division: '005',
    name: '실용영어문법(중급[토익350점이상500점이하])',
    credits: 3,
    professor: 'PETERSEN BRIAN T',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중404(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18313',
    division: '001',
    name: '영어발음클리닉',
    credits: 3,
    professor: 'CHELLEW ARIK GABE',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18313',
    division: '002',
    name: '영어발음클리닉',
    credits: 3,
    professor: 'CHELLEW ARIK GABE',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18320',
    division: '001',
    name: '동아시아의이해',
    credits: 3,
    professor: '김지영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18320',
    division: '002',
    name: '동아시아의이해',
    credits: 3,
    professor: '김지영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18321',
    division: '001',
    name: '취업영어인터뷰와자기소개',
    credits: 3,
    professor: 'OREILLY HAYES RORY PHILIP',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18321',
    division: '002',
    name: '취업영어인터뷰와자기소개',
    credits: 3,
    professor: 'OREILLY HAYES RORY PHILIP',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '001',
    name: '교양영어회화(초급[토익350점이하])',
    credits: 3,
    professor: 'CHANG INSOOK',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '002',
    name: '교양영어회화(중급[토익350점이상500점이하])',
    credits: 3,
    professor: 'KEVIN WAYNE CHAPMAN',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '003',
    name: '교양영어회화(초급[토익350점이하])',
    credits: 3,
    professor: 'HERNANDEZ ROBERTO',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '005',
    name: '교양영어회화(초급[토익350점이하])',
    credits: 3,
    professor: 'KIM JAMES CHAE PIL',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '006',
    name: '교양영어회화(초급[토익350점이하])',
    credits: 3,
    professor: 'KIM JAMES CHAE PIL',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '007',
    name: '교양영어회화(중급[토익350점이상500점이하])',
    credits: 3,
    professor: 'LEVEILLE BEAU RICHARD',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '008',
    name: '교양영어회화(중급[토익350점이상500점이하])',
    credits: 3,
    professor: 'MCGRATH JAMES GERARD',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '009',
    name: '교양영어회화(중급[토익350점이상500점이하])',
    credits: 3,
    professor: 'MILLER KEVIN AARON',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '010',
    name: '교양영어회화(초급[토익350점이하])',
    credits: 3,
    professor: 'POWER NIGEL JAMES',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '011',
    name: '교양영어회화(중급[토익350점이상500점이하])',
    credits: 3,
    professor: 'ANNE MARIE POWLESS',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중401(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '012',
    name: '교양영어회화(중급[토익350점이상500점이하])',
    credits: 3,
    professor: 'ROBERTS MICHAEL PATRICK',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '013',
    name: '교양영어회화(중급[토익350점이상500점이하])',
    credits: 3,
    professor: 'TAYLOR DAVID WILSON',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '014',
    name: '교양영어회화(초급[토익350점이하])',
    credits: 3,
    professor: 'WATSON ROBERT MATTHEW JAMES',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '015',
    name: '교양영어회화(중급[토익350점이상500점이하])',
    credits: 3,
    professor: 'YON EUNJI ANGELLA',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18337',
    division: '016',
    name: '교양영어회화(초급[토익350점이하])',
    credits: 3,
    professor: 'ZUNGU NKANYISO SIBONGISENI',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18405',
    division: '001',
    name: '기독교와사회정의',
    credits: 3,
    professor: '이규철',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18431',
    division: '001',
    name: '영화로만나는기독교',
    credits: 3,
    professor: '주은평',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18431',
    division: '002',
    name: '영화로만나는기독교',
    credits: 3,
    professor: '주은평',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18537',
    division: '001',
    name: '골프',
    credits: 3,
    professor: '민성희',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '18537',
    division: '002',
    name: '골프',
    credits: 3,
    professor: '민성희',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19479',
    division: '001',
    name: 'MOS특강',
    credits: 3,
    professor: '서병민',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19479',
    division: '002',
    name: 'MOS특강',
    credits: 3,
    professor: '서병민',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19479',
    division: '003',
    name: 'MOS특강',
    credits: 3,
    professor: '윤정희',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19479',
    division: '004',
    name: 'MOS특강',
    credits: 3,
    professor: '윤정희',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19555',
    division: '001',
    name: '한국정치의이해',
    credits: 3,
    professor: '임종화',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19556',
    division: '001',
    name: '한국어읽기와문법(2)(외국인유학생전용)',
    credits: 3,
    professor: '이은주',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19756',
    division: '001',
    name: '생활일본어',
    credits: 3,
    professor: 'AIZAWA YUKA',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19756',
    division: '002',
    name: '생활일본어',
    credits: 3,
    professor: 'AIZAWA YUKA',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영310',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19756',
    division: '003',
    name: '생활일본어',
    credits: 3,
    professor: '홍지형',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19756',
    division: '004',
    name: '생활일본어',
    credits: 3,
    professor: '홍지형',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20168',
    division: '001',
    name: '미술로 만나는 기독교',
    credits: 3,
    professor: '이미림',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20168',
    division: '002',
    name: '미술로 만나는 기독교',
    credits: 3,
    professor: '이미림',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20170',
    division: '001',
    name: '역사로 만나는 기독교',
    credits: 3,
    professor: '이민형',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20178',
    division: '001',
    name: '나와 세상을 바꾸는 NGO',
    credits: 3,
    professor: '배성훈',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20183',
    division: '001',
    name: '창의적읽기와토론',
    credits: 3,
    professor: '한혜진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20183',
    division: '002',
    name: '창의적읽기와토론',
    credits: 3,
    professor: '한혜진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20187',
    division: '001',
    name: '문학과 영화의 세계',
    credits: 3,
    professor: '설면희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20187',
    division: '002',
    name: '문학과 영화의 세계',
    credits: 3,
    professor: '설면희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20191',
    division: '001',
    name: '동양고전 산책',
    credits: 3,
    professor: '김의정',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영402',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20196',
    division: '001',
    name: '자기주도적 삶과 교육',
    credits: 3,
    professor: '이희영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20196',
    division: '002',
    name: '자기주도적 삶과 교육',
    credits: 3,
    professor: '이희영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20197',
    division: '001',
    name: '문학치료입문',
    credits: 3,
    professor: '김의정',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영402',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20198',
    division: '001',
    name: '여성과 커리어',
    credits: 3,
    professor: '강희수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20199',
    division: '001',
    name: '미디어와 현대사회',
    credits: 3,
    professor: '김기윤',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20199',
    division: '004',
    name: '미디어와 현대사회',
    credits: 3,
    professor: '유명식',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '기315',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20199',
    division: '005',
    name: '미디어와 현대사회',
    credits: 3,
    professor: '이종길',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20203',
    division: '001',
    name: '세계경제의 이해',
    credits: 3,
    professor: '서대성',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20205',
    division: '001',
    name: '포스트모던문화읽기',
    credits: 3,
    professor: '전윤경',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20207',
    division: '001',
    name: '현대음악 감상',
    credits: 3,
    professor: '고정화',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영301(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20207',
    division: '002',
    name: '현대음악 감상',
    credits: 3,
    professor: '고정화',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영301(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20207',
    division: '003',
    name: '현대음악 감상',
    credits: 3,
    professor: '김민성',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영301(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20207',
    division: '004',
    name: '현대음악 감상',
    credits: 3,
    professor: '김민성',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영301(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20211',
    division: '001',
    name: '서양미술의 이해',
    credits: 3,
    professor: '이미림',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20211',
    division: '002',
    name: '서양미술의 이해',
    credits: 3,
    professor: '이미림',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20213',
    division: '001',
    name: '공연예술과 문화',
    credits: 3,
    professor: '채진수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20213',
    division: '002',
    name: '공연예술과 문화',
    credits: 3,
    professor: '채진수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20213',
    division: '003',
    name: '공연예술과 문화',
    credits: 3,
    professor: '장유미',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20214',
    division: '001',
    name: '사진과비주얼커뮤니케이션',
    credits: 3,
    professor: '홍일',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20221',
    division: '001',
    name: '4차 산업 시대의 의사 소통방법론',
    credits: 3,
    professor: '이시종',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20221',
    division: '002',
    name: '4차 산업 시대의 의사 소통방법론',
    credits: 3,
    professor: '이시종',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20228',
    division: '001',
    name: '광고와 커뮤니케이션 전략',
    credits: 3,
    professor: '박상희',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '성B101(산경)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20228',
    division: '004',
    name: '광고와 커뮤니케이션 전략',
    credits: 3,
    professor: '정가은',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20229',
    division: '001',
    name: '디지털정보사회의이해',
    credits: 3,
    professor: '김진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20229',
    division: '002',
    name: '디지털정보사회의이해',
    credits: 3,
    professor: '김진',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20229',
    division: '003',
    name: '디지털정보사회의이해',
    credits: 3,
    professor: '방미향',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20230',
    division: '001',
    name: '생태환경과윤리',
    credits: 3,
    professor: '주시후',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중107',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20231',
    division: '001',
    name: '지속 가능한 녹색도시',
    credits: 3,
    professor: '주시후',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중108',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20231',
    division: '002',
    name: '지속 가능한 녹색도시(원격병행수업)',
    credits: 3,
    professor: '주시후',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20238',
    division: '001',
    name: '4차 산업혁명과 스타트업의 미래',
    credits: 3,
    professor: '김진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20238',
    division: '002',
    name: '4차 산업혁명과 스타트업의 미래',
    credits: 3,
    professor: '김진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20240',
    division: '001',
    name: '내 아이디어로 창업하기',
    credits: 3,
    professor: '이승환',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영402',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20242',
    division: '001',
    name: '창업을 위한 세무와 법률(원격수업)',
    credits: 3,
    professor: '김재희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20244',
    division: '001',
    name: '뇌과학과 인지과학',
    credits: 3,
    professor: '김정희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '재508호 강의실',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20248',
    division: '001',
    name: '지역전통문화와 스토리텔링',
    credits: 3,
    professor: '전윤경',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20250',
    division: '001',
    name: '휴머니즘과 포스트휴머니즘',
    credits: 3,
    professor: '신경수',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20256',
    division: '001',
    name: '마케팅 빅데이터 분석 및 이해',
    credits: 3,
    professor: '서대성',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중104(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20256',
    division: '002',
    name: '마케팅 빅데이터 분석 및 이해',
    credits: 3,
    professor: '채미혜',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중103(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20257',
    division: '001',
    name: '아이디어와 조형언어 디자인',
    credits: 3,
    professor: '홍일',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20265',
    division: '001',
    name: '기독교문화 컨텐츠 개발 및 활용',
    credits: 3,
    professor: '이종길',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20279',
    division: '001',
    name: '실무엑셀VBA',
    credits: 3,
    professor: '이수미',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중104(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20350',
    division: '001',
    name: '토익특강(LC)',
    credits: 3,
    professor: 'YUN PETER ILWOONG',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20350',
    division: '002',
    name: '토익특강(LC)',
    credits: 3,
    professor: 'YUN PETER ILWOONG',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20351',
    division: '001',
    name: '토익특강(RC)',
    credits: 3,
    professor: '손현',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20351',
    division: '002',
    name: '토익특강(RC)',
    credits: 3,
    professor: 'GOLDSMITH TIMOTHY NICHOLAS',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20351',
    division: '003',
    name: '토익특강(RC)',
    credits: 3,
    professor: 'GOLDSMITH TIMOTHY NICHOLAS',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중402(Lab)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20544',
    division: '001',
    name: '실용한문',
    credits: 3,
    professor: '류해춘',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영109',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20613',
    division: '001',
    name: '대학생활과역량개발',
    credits: 3,
    professor: '김영철',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영110',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20646',
    division: '001',
    name: '해외취업일본어(중급)',
    credits: 3,
    professor: '김혜연',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20782',
    division: '001',
    name: 'XR 기초이론',
    credits: 3,
    professor: '방미향',
    schedule: [
      {
        dayOfWeek: 5, // 금요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20846',
    division: '001',
    name: '기독교와 생활윤리',
    credits: 3,
    professor: '황은영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기315',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20847',
    division: '001',
    name: '성품과 직업',
    credits: 3,
    professor: '김택진',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20848',
    division: '001',
    name: '세계화와 이주민(원격수업)',
    credits: 3,
    professor: '서대성',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영302',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20849',
    division: '001',
    name: '역사를 바꾼 전쟁사',
    credits: 3,
    professor: '김민곤',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20850',
    division: '001',
    name: '인간 이해와 상담',
    credits: 3,
    professor: '전요섭',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20850',
    division: '002',
    name: '인간 이해와 상담',
    credits: 3,
    professor: '박성은',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영402',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20851',
    division: '001',
    name: '4차 산업 기반 기술의 이해',
    credits: 3,
    professor: '이수미',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20852',
    division: '001',
    name: '인공지능의 활용',
    credits: 3,
    professor: '김정희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '재508호 강의실',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20853',
    division: '001',
    name: '파이썬(Python)과 함께하는 코딩',
    credits: 3,
    professor: '전진오',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '중104(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20853',
    division: '002',
    name: '파이썬(Python)과 함께하는 코딩',
    credits: 3,
    professor: '전진오',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중104(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20853',
    division: '003',
    name: '파이썬(Python)과 함께하는 코딩',
    credits: 3,
    professor: '서병민',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중104(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20853',
    division: '004',
    name: '파이썬(Python)과 함께하는 코딩',
    credits: 3,
    professor: '서병민',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중104(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20854',
    division: '001',
    name: 'XR콘텐츠와 스토리 디자인',
    credits: 3,
    professor: '전윤경',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20854',
    division: '002',
    name: 'XR콘텐츠와 스토리 디자인',
    credits: 3,
    professor: '전윤경',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중205',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '20986',
    division: '001',
    name: '지식재산권',
    credits: 3,
    professor: '송찬규',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21011',
    division: '001',
    name: '안양학',
    credits: 3,
    professor: '김지석',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영201(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21101',
    division: '001',
    name: '메타버스 서비스 기획',
    credits: 3,
    professor: '박상희',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '학술202(SKU메타버스 강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21105',
    division: '001',
    name: '기독교 인성과 정신건강',
    credits: 3,
    professor: '최윤정',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영402',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21105',
    division: '002',
    name: '기독교 인성과 정신건강',
    credits: 3,
    professor: '이승용',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중201',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21463',
    division: '001',
    name: '품질경영으로의초대',
    credits: 3,
    professor: '김창수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영301(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21463',
    division: '002',
    name: '품질경영으로의초대',
    credits: 3,
    professor: '김창수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영301(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21463',
    division: '003',
    name: '품질경영으로의초대',
    credits: 3,
    professor: '김창수',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '영301(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21653',
    division: '001',
    name: '생명존중과인권',
    credits: 3,
    professor: '김재희',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영202',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21654',
    division: '001',
    name: '발표와토론',
    credits: 3,
    professor: '방인석',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 1,
        endPeriod: 3
      }
    ],
    location: '기315',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21654',
    division: '002',
    name: '발표와토론',
    credits: 3,
    professor: '방인석',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '기315',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21655',
    division: '001',
    name: '대인관계심리학',
    credits: 3,
    professor: '민이슬',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21655',
    division: '002',
    name: '대인관계심리학',
    credits: 3,
    professor: '민이슬',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 10,
        endPeriod: 12
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21655',
    division: '003',
    name: '대인관계심리학',
    credits: 3,
    professor: '이주혜',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21657',
    division: '001',
    name: '소셜벤처창업',
    credits: 3,
    professor: '송찬규',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21658',
    division: '001',
    name: '스마트애플리케이션코딩',
    credits: 3,
    professor: '정명범',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '중104(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21658',
    division: '002',
    name: '스마트애플리케이션코딩',
    credits: 3,
    professor: '정명범',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중104(컴퓨터실습실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21659',
    division: '001',
    name: '엔터테인먼트산업의이해',
    credits: 3,
    professor: '김기윤',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '성B101(산경)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21934',
    division: '001',
    name: '성공과행복의미학',
    credits: 3,
    professor: '박성은',
    schedule: [
      {
        dayOfWeek: 1, // 월요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영402',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21934',
    division: '002',
    name: '성공과행복의미학',
    credits: 3,
    professor: '최윤정',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영402',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21935',
    division: '001',
    name: '성과인간심리',
    credits: 3,
    professor: '한혜영',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중204',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21935',
    division: '002',
    name: '성과인간심리',
    credits: 3,
    professor: '황정은',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '중106',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21936',
    division: '001',
    name: '이상행동과중독',
    credits: 3,
    professor: '곽정임',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영301(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21936',
    division: '002',
    name: '이상행동과중독',
    credits: 3,
    professor: '곽정임',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영301(계단식강의실)',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21936',
    division: '003',
    name: '이상행동과중독',
    credits: 3,
    professor: '이주혜',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영203',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21938',
    division: '001',
    name: '드라마의세계',
    credits: 3,
    professor: '이신영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 4,
        endPeriod: 6
      }
    ],
    location: '영402',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21938',
    division: '002',
    name: '드라마의세계',
    credits: 3,
    professor: '이신영',
    schedule: [
      {
        dayOfWeek: 2, // 화요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영402',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21938',
    division: '003',
    name: '드라마의세계',
    credits: 3,
    professor: '이신영',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 7,
        endPeriod: 9
      }
    ],
    location: '영402',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00046',
    division: '001',
    name: '채플(일반대학2-4학년)',
    credits: 0,
    professor: '',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 13,
        endPeriod: 13
      }
    ],
    location: '기501',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '07000',
    division: '001',
    name: '채플(제자반)(일반대학1학년)',
    credits: 0,
    professor: '',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 3,
        endPeriod: 3
      }
    ],
    location: '',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '07000',
    division: '002',
    name: '채플(제자반)(자율전공학부1학년)',
    credits: 0,
    professor: '',
    schedule: [
      {
        dayOfWeek: 3, // 수요일
        startPeriod: 2,
        endPeriod: 2
      }
    ],
    location: '',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '07000',
    division: '003',
    name: '채플(제자반)(신학대학1학년)',
    credits: 0,
    professor: '',
    schedule: [
      {
        dayOfWeek: 4, // 목요일
        startPeriod: 7,
        endPeriod: 7
      }
    ],
    location: '',
    note: '',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '00078',
    division: '001',
    name: '대한민국1%가될수있는재테크상식(KCU온라인강좌)',
    credits: 3,
    professor: '',
    schedule: [],
    location: '',
    note: 'KCU',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '19506',
    division: '001',
    name: '현대인의질병과영양(KCU온라인강좌)',
    credits: 3,
    professor: '',
    schedule: [],
    location: '',
    note: 'KCU',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '21797',
    division: '001',
    name: '영화를통해세상을보다(KCU온라인강좌)',
    credits: 3,
    professor: '',
    schedule: [],
    location: '',
    note: 'KCU',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    grade: 1,
    category: '교양선택',
    code: '22065',
    division: '001',
    name: '연애의기술(KCU온라인강좌)',
    credits: 3,
    professor: '',
    schedule: [],
    location: '',
    note: 'KCU',
    semester: '2025-2',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

// 모든 수업 데이터 통합
const allCourses = [...theologyCourses, ...educationCounselingCourses, ...culturalMissionCourses, ...englishLiteratureCourses, ...chineseLiteratureCourses, ...koreanLiteratureCourses, ...socialWorkCourses, ...internationalDevelopmentCourses, ...publicAdministrationCourses, ...tourismCourses, ...businessCourses, ...globalLogisticsCourses, ...industrialEngineeringCourses, ...earlyChildhoodEducationCourses, ...physicalEducationCourses, ...teacherEducationCourses, ...computerEngineeringCourses, ...informationCommunicationCourses, ...mediaSoftwareCourses, ...urbanDesignCourses, ...musicDepartmentCourses, ...practicalMusicCourses, ...performingMusicCourses, ...actingArtsCourses, ...filmVideoCourses, ...theaterFilmCourses, ...beautyDesignCourses, ...convergenceStudiesCourses, ...paideiaStudiesCourses];

async function addAllCourses() {
  try {
    console.log('📚 수업 데이터 추가 시작...');
    
    const batch = db.batch();
    let totalAdded = 0;
    let totalDepartmentCompleted = 0;

    
    // 신학과 수업 데이터 추가
    console.log(`\n🎓 신학과 수업 데이터 추가 중... (${theologyCourses.length}개)`);
    theologyCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 신학과 수업 ${theologyCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 기독교교육상담학과 수업 데이터 추가
    console.log(`\n🎓 기독교교육상담학과 수업 데이터 추가 중... (${educationCounselingCourses.length}개)`);
    educationCounselingCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 기독교교육상담학과 수업 ${educationCounselingCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;

    // 문화선교학과 수업 데이터 추가
    console.log(`\n🎓 문화선교학과 수업 데이터 추가 중... (${culturalMissionCourses.length}개)`);
    culturalMissionCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 문화선교학과 수업 ${culturalMissionCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 영어영문학과 수업 데이터 추가
    console.log(`\n🎓 영어영문학과 수업 데이터 추가 중... (${englishLiteratureCourses.length}개)`);
    englishLiteratureCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 영어영문학과 수업 ${englishLiteratureCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 중어중문학과 수업 데이터 추가
    console.log(`\n🎓 중어중문학과 수업 데이터 추가 중... (${chineseLiteratureCourses.length}개)`);
    chineseLiteratureCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 중어중문학과 수업 ${chineseLiteratureCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;

    // 국어국문학과 수업 데이터 추가
    console.log(`\n🎓 국어국문학과 수업 데이터 추가 중... (${koreanLiteratureCourses.length}개)`);
    koreanLiteratureCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 국어국문학과 수업 ${koreanLiteratureCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 사회복지학과 수업 데이터 추가
    console.log(`\n🎓 사회복지학과 수업 데이터 추가 중... (${socialWorkCourses.length}개)`);
    socialWorkCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 사회복지학과 수업 ${socialWorkCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 국제개발협력학과 수업 데이터 추가
    console.log(`\n🎓 국제개발협력학과 수업 데이터 추가 중... (${internationalDevelopmentCourses.length}개)`);
    internationalDevelopmentCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 국제개발협력학과 수업 ${internationalDevelopmentCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 행정학과 수업 데이터 추가
    console.log(`\n🎓 행정학과 수업 데이터 추가 중... (${publicAdministrationCourses.length}개)`);
    publicAdministrationCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 행정학과 수업 ${publicAdministrationCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 관광학과 수업 데이터 추가
    console.log(`\n🎓 관광학과 수업 데이터 추가 중... (${tourismCourses.length}개)`);
    tourismCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 관광학과 수업 ${tourismCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 경영학과 수업 데이터 추가
    console.log(`\n🎓 경영학과 수업 데이터 추가 중... (${businessCourses.length}개)`);
    businessCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 경영학과 수업 ${businessCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 글로벌물류학과 수업 데이터 추가
    console.log(`\n🎓 글로벌물류학과 수업 데이터 추가 중... (${globalLogisticsCourses.length}개)`);
    globalLogisticsCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 글로벌물류학과 수업 ${globalLogisticsCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 산업경영공학과 수업 데이터 추가
    console.log(`\n🎓 산업경영공학과 수업 데이터 추가 중... (${industrialEngineeringCourses.length}개)`);
    industrialEngineeringCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 산업경영공학과 수업 ${industrialEngineeringCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 유아교육과 수업 데이터 추가
    console.log(`\n🎓 유아교육과 수업 데이터 추가 중... (${earlyChildhoodEducationCourses.length}개)`);
    earlyChildhoodEducationCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 유아교육과 수업 ${earlyChildhoodEducationCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 체육교육과 수업 데이터 추가
    console.log(`\n🎓 체육교육과 수업 데이터 추가 중... (${physicalEducationCourses.length}개)`);
    physicalEducationCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 체육교육과 수업 ${physicalEducationCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 교직부 수업 데이터 추가
    console.log(`\n🎓 교직부 수업 데이터 추가 중... (${teacherEducationCourses.length}개)`);
    teacherEducationCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 교직부 수업 ${teacherEducationCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;

    // 컴퓨터공학과 수업 데이터 추가
    console.log(`\n💻 컴퓨터공학과 수업 데이터 추가 중... (${computerEngineeringCourses.length}개)`);
    computerEngineeringCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 컴퓨터공학과 수업 ${computerEngineeringCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 정보통신공학과 수업 데이터 추가
    console.log(`\n📡 정보통신공학과 수업 데이터 추가 중... (${informationCommunicationCourses.length}개)`);
    informationCommunicationCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 정보통신공학과 수업 ${informationCommunicationCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 미디어소프트웨어학과 수업 데이터 추가
    console.log(`\n🎮 미디어소프트웨어학과 수업 데이터 추가 중... (${mediaSoftwareCourses.length}개)`);
    mediaSoftwareCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 미디어소프트웨어학과 수업 ${mediaSoftwareCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 도시디자인정보공학과 수업 데이터 추가
    console.log(`\n🏙️ 도시디자인정보공학과 수업 데이터 추가 중... (${urbanDesignCourses.length}개)`);
    urbanDesignCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 도시디자인정보공학과 수업 ${urbanDesignCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 음악학부 수업 데이터 추가
    console.log(`\n🎵 음악학부 수업 데이터 추가 중... (${musicDepartmentCourses.length}개)`);
    musicDepartmentCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 음악학부 수업 ${musicDepartmentCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 실용음악과 수업 데이터 추가
    console.log(`\n🎤 실용음악과 수업 데이터 추가 중... (${practicalMusicCourses.length}개)`);
    practicalMusicCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 실용음악과 수업 ${practicalMusicCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 공연음악예술학부 수업 데이터 추가
    console.log(`\n🎭 공연음악예술학부 수업 데이터 추가 중... (${performingMusicCourses.length}개)`);
    performingMusicCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 공연음악예술학부 수업 ${performingMusicCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 연기예술학과 수업 데이터 추가
    console.log(`\n🎬 연기예술학과 수업 데이터 추가 중... (${actingArtsCourses.length}개)`);
    actingArtsCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 연기예술학과 수업 ${actingArtsCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 영화영상학과 수업 데이터 추가
    console.log(`\n🎥 영화영상학과 수업 데이터 추가 중... (${filmVideoCourses.length}개)`);
    filmVideoCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 영화영상학과 수업 ${filmVideoCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 연극영화학부 수업 데이터 추가
    console.log(`\n🎪 연극영화학부 수업 데이터 추가 중... (${theaterFilmCourses.length}개)`);
    theaterFilmCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 연극영화학부 수업 ${theaterFilmCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;

    // 뷰티디자인학과 수업 데이터 추가
    console.log(`\n💄 뷰티디자인학과 수업 데이터 추가 중... (${beautyDesignCourses.length}개)`);
    beautyDesignCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 뷰티디자인학과 수업 ${beautyDesignCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;

    // 융합학부 수업 데이터 추가
    console.log(`\n🔬 융합학부 수업 데이터 추가 중... (${convergenceStudiesCourses.length}개)`);
    convergenceStudiesCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 융합학부 수업 ${convergenceStudiesCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;

    // 파이데이아학부 수업 데이터 추가
    console.log(`\n📖 파이데이아학부 수업 데이터 추가 중... (${paideiaStudiesCourses.length}개)`);
    paideiaStudiesCourses.forEach((courseData, index) => {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, courseData);
      console.log(`  ${index + 1}. ${courseData.name} (${courseData.code}) - ${courseData.professor} - ${courseData.category} - ${courseData.grade}학년`);
      totalAdded++;
    });
    console.log(`✅ 파이데이아학부 수업 ${paideiaStudiesCourses.length}개 추가 완료!`);
    totalDepartmentCompleted++;
    
    // 모든 데이터를 Firestore에 일괄 업로드
    await batch.commit();
    
    console.log('\n🎉 모든 수업 데이터 추가 완료!');
    console.log(`   - 신학과: ${theologyCourses.length}개`);
    console.log(`   - 기독교교육상담학과: ${educationCounselingCourses.length}개`);
    console.log(`   - 문화선교학과: ${culturalMissionCourses.length}개`);
    console.log(`   - 영어영문학과: ${englishLiteratureCourses.length}개`);
    console.log(`   - 중어중문학과: ${chineseLiteratureCourses.length}개`);
    console.log(`   - 국어국문학과: ${koreanLiteratureCourses.length}개`);
    console.log(`   - 사회복지학과: ${socialWorkCourses.length}개`);
    console.log(`   - 국제개발협력학과: ${internationalDevelopmentCourses.length}개`);
    console.log(`   - 행정학과: ${publicAdministrationCourses.length}개`);
    console.log(`   - 관광학과: ${tourismCourses.length}개`);
    console.log(`   - 경영학과: ${businessCourses.length}개`);
    console.log(`   - 글로벌물류학과: ${globalLogisticsCourses.length}개`);
    console.log(`   - 산업경영공학과: ${industrialEngineeringCourses.length}개`);
    console.log(`   - 유아교육과: ${earlyChildhoodEducationCourses.length}개`);
    console.log(`   - 체육교육과: ${physicalEducationCourses.length}개`);
    console.log(`   - 교직부: ${teacherEducationCourses.length}개`);
    console.log(`   - 컴퓨터공학과: ${computerEngineeringCourses.length}개`);
    console.log(`   - 정보통신공학과: ${informationCommunicationCourses.length}개`);
    console.log(`   - 미디어소프트웨어학과: ${mediaSoftwareCourses.length}개`);
    console.log(`   - 도시디자인정보공학과: ${urbanDesignCourses.length}개`);
    console.log(`   - 음악학부: ${musicDepartmentCourses.length}개`);
    console.log(`   - 실용음악과: ${practicalMusicCourses.length}개`);
    console.log(`   - 공연음악예술학부: ${performingMusicCourses.length}개`);
    console.log(`   - 연기예술학과: ${actingArtsCourses.length}개`);
    console.log(`   - 영화영상학과: ${filmVideoCourses.length}개`);
    console.log(`   - 연극영화학부: ${theaterFilmCourses.length}개`);
    console.log(`   - 뷰티디자인학과: ${beautyDesignCourses.length}개`);
    console.log(`   - 융합학부: ${convergenceStudiesCourses.length}개`);
    console.log(`   - 파이데이아학부: ${paideiaStudiesCourses.length}개`);
    console.log(`   - 총 ${totalDepartmentCompleted}개의 학과가 완료되었습니다.`);
    console.log(`📊 총 ${totalAdded}개의 수업이 추가되었습니다.`);
    console.log('📅 교시 단위 시스템으로 정확히 매핑되었습니다.');
    
  } catch (error) {
    console.error('❌ 수업 데이터 추가 실패:', error);
  } finally {
    process.exit(0);
  }
}

addAllCourses();