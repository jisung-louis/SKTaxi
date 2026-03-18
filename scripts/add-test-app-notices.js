const admin = require('firebase-admin');
const serviceAccount = require('../firebase-cloud-functions/serviceAccountKey.json');

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sktaxi-7b8b4-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

const now = admin.firestore.Timestamp.fromDate(new Date());
const testNotices = [
  {
    title: '새로운 익명 댓글 기능 출시! 테스트용으로 아주 긴 제목을 작성해보도록하겠습니다 굉장히 길죠? 네 저도 그렇게 생각합니다 꽤 기네요',
    content: '이제 게시판과 공지사항에서 익명으로 댓글을 작성할 수 있습니다. 익명 댓글은 "익명1", "익명2" 형태로 순서대로 표시되며, 개인정보 보호에 더욱 신경쓰실 수 있습니다.',
    category: 'update',
    priority: 'normal',
    publishedAt: now,
    updatedAt: now,
    imageUrl: null,
    actionUrl: null
  },
  // {
  //   title: '서비스 점검 안내 (1월 20일)',
  //   content: '더 나은 서비스 제공을 위해 2024년 1월 20일 오전 2시부터 오전 4시까지 서비스 점검을 실시합니다. 점검 시간 동안 일시적으로 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.',
  //   category: 'service',
  //   priority: 'urgent',
  //   publishedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-18T09:00:00Z')),
  //   imageUrl: null,
  //   actionUrl: null
  // },
  // {
  //   title: '신학기 이벤트 - 택시비 할인 쿠폰',
  //   content: '신학기를 맞아 택시비 할인 쿠폰을 제공합니다! 2월 한 달간 택시비 20% 할인 쿠폰을 받아보세요. 자세한 내용은 앱 내 이벤트 페이지를 확인해주세요.',
  //   category: 'event',
  //   priority: 'info',
  //   publishedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-10T14:30:00Z')),
  //   imageUrl: null,
  //   actionUrl: null
  // }
];

async function addTestNotices() {
  try {
    console.log('테스트 앱 공지사항 추가 시작...');
    
    for (const notice of testNotices) {
      const docRef = await db.collection('appNotices').add(notice);
      console.log(`✅ 공지사항 추가 완료: ${notice.title} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 모든 테스트 공지사항이 성공적으로 추가되었습니다!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 공지사항 추가 실패:', error);
    process.exit(1);
  }
}

addTestNotices();
