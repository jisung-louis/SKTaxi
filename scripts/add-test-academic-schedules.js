const admin = require('firebase-admin');
const serviceAccount = require('../firebase-cloud-functions/serviceAccountKey.json');

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sktaxi-7b8b4-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

const addTestAcademicSchedules = async () => {
  console.log('테스트 학사일정 추가 시작...');

  try {
    const testSchedules = [
      {
        title: '수강신청 정정 기간',
        startDate: '2025-10-06',
        endDate: '2025-10-10',
        type: 'multi',
        priority: 1,
        description: '수강신청 정정 및 추가신청 기간',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: '축제 주간',
        startDate: '2025-10-27',
        endDate: '2025-10-27',
        type: 'single',
        priority: 2,
        description: '성결대학교 축제 주간',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: '중간고사',
        startDate: '2025-11-04',
        endDate: '2025-11-08',
        type: 'multi',
        priority: 1,
        description: '2025학년도 2학기 중간고사',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: '졸업사정회',
        startDate: '2025-11-15',
        endDate: '2025-11-15',
        type: 'single',
        priority: 1,
        description: '2025학년도 전기 졸업사정회',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: '기말고사',
        startDate: '2025-12-16',
        endDate: '2025-12-20',
        type: 'multi',
        priority: 1,
        description: '2025학년도 2학기 기말고사',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: '겨울방학',
        startDate: '2025-12-23',
        endDate: '2026-02-28',
        type: 'multi',
        priority: 2,
        description: '2025학년도 겨울방학',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    ];

    for (const schedule of testSchedules) {
      const docRef = await db.collection('academicSchedules').add(schedule);
      console.log(`✅ 학사일정 추가 완료: ${schedule.title} (ID: ${docRef.id})`);
    }
    
    console.log('\n📅 추가된 학사일정:');
    testSchedules.forEach((schedule, index) => {
      console.log(`${index + 1}. ${schedule.title} (${schedule.startDate} ~ ${schedule.endDate})`);
    });
    
    console.log('\n🎉 모든 테스트 학사일정이 성공적으로 추가되었습니다!');
    
  } catch (error) {
    console.error('❌ 학사일정 추가 실패:', error);
  }
};

addTestAcademicSchedules().catch(console.error);
