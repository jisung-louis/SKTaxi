const admin = require('firebase-admin');

const serviceAccount = require('../firebase-cloud-functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const testCourses = [
  {
    grade: 2,
    category: '전공필수',
    code: '99901',
    division: '001',
    name: '자료구조',
    credits: 3,
    professor: '김테스트',
    schedule: [
      { dayOfWeek: 1, startPeriod: 1, endPeriod: 3 },
    ],
    location: '정301호',
    note: '2026-1 테스트 데이터',
    semester: '2026-1',
    department: '컴퓨터공학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    grade: 1,
    category: '교양필수',
    code: '99902',
    division: '001',
    name: '채플',
    credits: 1,
    professor: '박채플',
    schedule: [
      { dayOfWeek: 3, startPeriod: 5, endPeriod: 5 },
    ],
    location: '대강당',
    note: '2026-1 테스트 데이터',
    semester: '2026-1',
    department: '파이데이아학부',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    grade: 3,
    category: '전공선택',
    code: '99903',
    division: '001',
    name: '모바일앱개발',
    credits: 3,
    professor: '이모바일',
    schedule: [
      { dayOfWeek: 2, startPeriod: 4, endPeriod: 6 },
      { dayOfWeek: 4, startPeriod: 4, endPeriod: 6 },
    ],
    location: '정405호',
    note: '2026-1 테스트 데이터',
    semester: '2026-1',
    department: '소프트웨어학과',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
];

async function addTestCourses() {
  try {
    console.log('📚 2026-1학기 테스트 수업 데이터 추가 시작...\n');

    for (const course of testCourses) {
      const ref = db.collection('courses').doc();
      await ref.set(course);

      const days = ['', '월', '화', '수', '목', '금'];
      const scheduleStr = course.schedule
        .map(s => `${days[s.dayOfWeek]} ${s.startPeriod}-${s.endPeriod}교시`)
        .join(', ');

      console.log(`✅ ${course.name}`);
      console.log(`   ID: ${ref.id}`);
      console.log(`   ${course.department} | ${course.category} | ${course.credits}학점`);
      console.log(`   ${course.professor} | ${scheduleStr} | ${course.location}\n`);
    }

    console.log(`🎉 총 ${testCourses.length}개 테스트 수업 추가 완료!`);
  } catch (error) {
    console.error('❌ 테스트 수업 데이터 추가 실패:', error);
  } finally {
    process.exit(0);
  }
}

addTestCourses();
