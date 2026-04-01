const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
const serviceAccount = require('../firebase-cloud-functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 월7-12 더미 수업 데이터
const dummyCourse = {
  grade: 1,
  category: '교양선택',
  code: '00000',
  division: '001',
  name: '테스트수업(월9-10)길이가굉장히긴이름테스트를위한수업이름입니다',
  credits: 3,
  professor: '테스트',
  schedule: [
    {
      dayOfWeek: 1, // 월요일
      startPeriod: 9,
      endPeriod: 10
    }
  ],
  location: '테스트강의실이름이 굉장히 길 때 테스트',
  note: '테스트용 더미 데이터',
  semester: '2025-2',
  department: '파이데이아학부',
  createdAt: admin.firestore.Timestamp.now(),
  updatedAt: admin.firestore.Timestamp.now()
};

async function addDummyCourse() {
  try {
    console.log('📚 테스트용 더미 수업 데이터 추가 시작...');
    
    const courseRef = db.collection('courses').doc();
    await courseRef.set(dummyCourse);
    
    console.log('✅ 더미 수업 데이터 추가 완료!');
    console.log(`   - 수업명: ${dummyCourse.name}`);
    console.log(`   - 교수: ${dummyCourse.professor}`);
    console.log(`   - 시간: 월요일 7-12교시`);
    console.log(`   - 학점: ${dummyCourse.credits}학점`);
    console.log(`   - 이수구분: ${dummyCourse.category}`);
    
  } catch (error) {
    console.error('❌ 더미 수업 데이터 추가 실패:', error);
  } finally {
    process.exit(0);
  }
}

addDummyCourse();

