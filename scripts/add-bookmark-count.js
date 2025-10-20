const admin = require('firebase-admin');
const serviceAccount = require('../functions/serviceAccountKey.json');

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sktaxi-acb4c-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function addBookmarkCountToExistingPosts() {
  try {
    console.log('기존 게시글에 bookmarkCount 필드 추가 중...');
    
    const snapshot = await db.collection('boardPosts').get();
    const batch = db.batch();
    let updateCount = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // bookmarkCount 필드가 없는 경우에만 추가
      if (data.bookmarkCount === undefined) {
        batch.update(doc.ref, {
          bookmarkCount: 0
        });
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ ${updateCount}개의 게시글에 bookmarkCount 필드가 추가되었습니다.`);
    } else {
      console.log('✅ 모든 게시글이 이미 bookmarkCount 필드를 가지고 있습니다.');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    process.exit(0);
  }
}

addBookmarkCountToExistingPosts();
