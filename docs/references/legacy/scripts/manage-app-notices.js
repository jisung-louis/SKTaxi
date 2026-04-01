/*
  Usage:
  - Create: node scripts/manage-app-notices.js create --file ./notice.json
    or:     node scripts/manage-app-notices.js create --title "제목" --content "내용" --category update --priority normal

  - Update: node scripts/manage-app-notices.js update --id <noticeId> --file ./partial.json
    or:     node scripts/manage-app-notices.js update --id <noticeId> --title "새 제목"

  - Delete: node scripts/manage-app-notices.js delete --id <noticeId>
            (also deletes all user notifications where data.appNoticeId === noticeId)
*/

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Firebase Admin 초기화
const serviceKeyPath = path.resolve(__dirname, '../firebase-cloud-functions/serviceAccountKey.json');
if (!fs.existsSync(serviceKeyPath)) {
  console.error('❌ serviceAccountKey.json을 찾을 수 없습니다:', serviceKeyPath);
  process.exit(1);
}

const serviceAccount = require(serviceKeyPath);

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

function parseArgs() {
  const [, , command, ...rest] = process.argv;
  const args = { command };
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

function loadJson(filePath) {
  const abs = path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(abs, 'utf8');
  return JSON.parse(raw);
}

function normalizeImageUrls(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  // 쉼표로 구분된 문자열 허용
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function buildNoticeFromArgs(args) {
  const now = admin.firestore.Timestamp.fromDate(new Date());
  const imageUrls = normalizeImageUrls(args.imageUrls || args.imageUrl);
  return {
    title: args.title || '제목 없음',
    content: args.content || '',
    category: args.category || 'info',
    priority: args.priority || 'normal',
    publishedAt: args.publishedAt ? admin.firestore.Timestamp.fromDate(new Date(args.publishedAt)) : now,
    updatedAt: now,
    imageUrls,
    actionUrl: args.actionUrl || null,
  };
}

async function createNotice(args) {
  const data = args.file
    ? (() => {
        const raw = loadJson(args.file);
        const normalized = {
          ...raw,
          imageUrls: normalizeImageUrls(raw.imageUrls || raw.imageUrl),
          actionUrl: raw.actionUrl || null,
        };
        if (normalized.publishedAt) {
          normalized.publishedAt = normalized.publishedAt.toDate
            ? normalized.publishedAt
            : admin.firestore.Timestamp.fromDate(new Date(normalized.publishedAt));
        } else {
          normalized.publishedAt = admin.firestore.Timestamp.fromDate(new Date());
        }
        normalized.updatedAt = admin.firestore.Timestamp.fromDate(new Date());
        delete normalized.imageUrl;
        return normalized;
      })()
    : buildNoticeFromArgs(args);
  // 필수 필드 보정
  if (!data.title) data.title = '제목 없음';
  if (!data.publishedAt) data.publishedAt = admin.firestore.Timestamp.fromDate(new Date());

  const ref = await db.collection('appNotices').add(data);
  console.log(`✅ 앱 공지 생성 완료: ${data.title} (ID: ${ref.id})`);
}

async function updateNotice(args) {
  const { id } = args;
  if (!id) {
    console.error('❌ update에는 --id 가 필요합니다');
    process.exit(1);
  }
  let data = {};
  if (args.file) {
    data = loadJson(args.file);
  } else {
    const keys = ['title', 'content', 'category', 'priority', 'imageUrls', 'imageUrl', 'actionUrl', 'publishedAt'];
    for (const k of keys) {
      if (args[k] !== undefined) data[k] = args[k];
    }
    if (data.publishedAt) {
      data.publishedAt = admin.firestore.Timestamp.fromDate(new Date(data.publishedAt));
    }
    if (data.imageUrl && !data.imageUrls) {
      data.imageUrls = normalizeImageUrls(data.imageUrl);
      delete data.imageUrl;
    }
    if (data.imageUrls) {
      data.imageUrls = normalizeImageUrls(data.imageUrls);
    }
  }

  // 항상 updatedAt 갱신
  data.updatedAt = admin.firestore.Timestamp.fromDate(new Date());

  if (Object.keys(data).length === 1 && data.updatedAt) {
    console.error('❌ 업데이트할 필드가 없습니다');
    process.exit(1);
  }

  await db.collection('appNotices').doc(id).set(data, { merge: true });
  console.log(`✅ 앱 공지 업데이트 완료: ${id}`);
}

async function deleteNoticeAndUserNotifications(args) {
  const { id } = args;
  if (!id) {
    console.error('❌ delete에는 --id 가 필요합니다');
    process.exit(1);
  }

  // 1) appNotices 문서 삭제
  await db.collection('appNotices').doc(id).delete().catch((e) => {
    if (e.code === 5 /* not-found */) return; // 없으면 무시
    throw e;
  });
  console.log(`🗑️  앱 공지 삭제 완료: ${id}`);

  // 2) 모든 유저 알림 중 data.appNoticeId === id 인 문서 삭제 (collectionGroup)
  console.log('🔎 사용자 알림 삭제 중... (data.appNoticeId == noticeId)');
  const cgSnap = await db.collectionGroup('notifications')
    .where('data.appNoticeId', '==', String(id))
    .get();

  if (cgSnap.empty) {
    console.log('ℹ️  삭제 대상 사용자 알림이 없습니다');
    return;
  }

  const docs = cgSnap.docs;
  console.log(`🧹 삭제 대상 알림 문서 수: ${docs.length}`);

  const BATCH_SIZE = 450; // 여유를 두고 450으로 세이프가드
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = docs.slice(i, i + BATCH_SIZE);
    for (const d of slice) {
      batch.delete(d.ref);
    }
    await batch.commit();
    console.log(`  - 배치 삭제 완료 (${i + slice.length}/${docs.length})`);
  }
  console.log('✅ 관련 사용자 알림 삭제 완료');
}

async function main() {
  const args = parseArgs();
  const { command } = args;
  try {
    if (command === 'create') {
      await createNotice(args);
    } else if (command === 'update') {
      await updateNotice(args);
    } else if (command === 'delete') {
      await deleteNoticeAndUserNotifications(args);
    } else {
      console.log('Usage:');
      console.log('  node scripts/manage-app-notices.js create --file ./notice.json');
      console.log('  node scripts/manage-app-notices.js create --title "제목" --content "내용" --category update --priority normal');
      console.log('  node scripts/manage-app-notices.js update --id <noticeId> --file ./partial.json');
      console.log('  node scripts/manage-app-notices.js update --id <noticeId> --title "새 제목"');
      console.log('  node scripts/manage-app-notices.js delete --id <noticeId>');
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ 작업 실패:', err);
    process.exit(1);
  }
}

main();






