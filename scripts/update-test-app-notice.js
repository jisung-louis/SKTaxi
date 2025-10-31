/*
  테스트용 앱 공지 업데이트 스크립트

  사용 예)
  - ID 지정 업데이트:
    node scripts/update-test-app-notice.js --id <noticeId> --title "수정된 제목" --content "수정된 내용"

  - ID 미지정(최근 문서 1건 업데이트):
    node scripts/update-test-app-notice.js --title "수정된 제목"

  - 샘플 타이틀로 찾기(정확 매칭):
    node scripts/update-test-app-notice.js --findTitle "새로운 익명 댓글 기능 출시!" --content "UI 테스트용으로 본문 수정"
*/

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Firebase Admin 초기화
const serviceKeyPath = path.resolve(__dirname, '../functions/serviceAccountKey.json');
if (!fs.existsSync(serviceKeyPath)) {
  console.error('❌ serviceAccountKey.json을 찾을 수 없습니다:', serviceKeyPath);
  process.exit(1);
}
const serviceAccount = require(serviceKeyPath);
if (admin.apps.length === 0) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

function parseArgs() {
  const [, , ...rest] = process.argv;
  const args = {};
  for (let i = 0; i < rest.length; i++) {
    if (rest[i].startsWith('--')) {
      const key = rest[i].slice(2);
      const next = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[i + 1] : true;
      args[key] = next;
      if (next !== true) i++;
    }
  }
  return args;
}

async function resolveTargetId(args) {
  if (args.id) return args.id;
  const noticesRef = db.collection('appNotices');
  if (args.findTitle) {
    const snap = await noticesRef.where('title', '==', args.findTitle).limit(1).get();
    if (!snap.empty) return snap.docs[0].id;
    console.error('❌ 해당 제목의 문서를 찾을 수 없습니다:', args.findTitle);
    process.exit(1);
  }
  // 기본: 최신 문서 1건
  const snap = await noticesRef.orderBy('publishedAt', 'desc').limit(1).get();
  if (snap.empty) {
    console.error('❌ 업데이트할 문서가 없습니다(appNotices 비어있음)');
    process.exit(1);
  }
  return snap.docs[0].id;
}

async function main() {
  const args = parseArgs();
  const id = await resolveTargetId(args);

  const update = {};
  const keys = ['title', 'content', 'category', 'priority', 'imageUrl', 'actionUrl'];
  for (const k of keys) {
    if (args[k] !== undefined) update[k] = args[k];
  }
  // 기본 변경 값(아무 것도 주지 않으면 제목에 (수정) 표시)
  if (Object.keys(update).length === 0) {
    update.title = '(수정) 테스트 공지 - ' + new Date().toLocaleString();
  }
  update.updatedAt = admin.firestore.Timestamp.fromDate(new Date());

  await db.collection('appNotices').doc(id).set(update, { merge: true });
  console.log(`✅ 업데이트 완료: ${id}`);
}

main().catch((e) => {
  console.error('❌ 실패:', e);
  process.exit(1);
});


