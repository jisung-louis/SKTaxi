/*
  앱 버전 관리 스크립트
  
  Usage:
  - Create: node scripts/manage-app-version.js create --ios-version 1.0.0 --android-version 1.0.0 --force-update true
    or:     node scripts/manage-app-version.js create --file ./version-config.json
  
  - Update: node scripts/manage-app-version.js update --platform ios --version 1.1.0 --force-update true --message "업데이트 메시지"
    or:     node scripts/manage-app-version.js update --platform ios --file ./version-update.json
  
  - Get:    node scripts/manage-app-version.js get
            node scripts/manage-app-version.js get --platform ios
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

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

async function createVersion(args) {
  let iosData = {};
  let androidData = {};

  if (args.file) {
    // JSON 파일에서 로드
    const config = loadJson(args.file);
    iosData = config.ios || {};
    androidData = config.android || {};
  } else {
    // CLI 인자에서 생성
    iosData = {
      minimumVersion: args['ios-version'] || '0.0.1',
      forceUpdate: parseBoolean(args['force-update'] !== undefined ? args['force-update'] : args['ios-force-update']),
      message: args['ios-message'] || args.message || undefined,
    };
    
    androidData = {
      minimumVersion: args['android-version'] || args['ios-version'] || '0.0.1',
      forceUpdate: parseBoolean(args['force-update'] !== undefined ? args['force-update'] : args['android-force-update']),
      message: args['android-message'] || args.message || undefined,
    };
  }

  // 필수 필드 검증
  if (!iosData.minimumVersion || !androidData.minimumVersion) {
    console.error('❌ minimumVersion은 필수입니다');
    process.exit(1);
  }

  // iOS 문서 생성/업데이트
  const iosRef = db.collection('appVersion').doc('ios');
  await iosRef.set({
    minimumVersion: iosData.minimumVersion,
    forceUpdate: iosData.forceUpdate !== undefined ? iosData.forceUpdate : false,
    message: iosData.message || null,
    updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
  }, { merge: true });
  console.log(`✅ iOS 버전 설정 완료:`);
  console.log(`   - 최소 버전: ${iosData.minimumVersion}`);
  console.log(`   - 강제 업데이트: ${iosData.forceUpdate !== undefined ? iosData.forceUpdate : false}`);
  if (iosData.message) {
    console.log(`   - 메시지: ${iosData.message}`);
  }

  // Android 문서 생성/업데이트
  const androidRef = db.collection('appVersion').doc('android');
  await androidRef.set({
    minimumVersion: androidData.minimumVersion,
    forceUpdate: androidData.forceUpdate !== undefined ? androidData.forceUpdate : false,
    message: androidData.message || null,
    updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
  }, { merge: true });
  console.log(`✅ Android 버전 설정 완료:`);
  console.log(`   - 최소 버전: ${androidData.minimumVersion}`);
  console.log(`   - 강제 업데이트: ${androidData.forceUpdate !== undefined ? androidData.forceUpdate : false}`);
  if (androidData.message) {
    console.log(`   - 메시지: ${androidData.message}`);
  }
}

async function updateVersion(args) {
  const { platform } = args;
  if (!platform || !['ios', 'android'].includes(platform)) {
    console.error('❌ update에는 --platform ios 또는 --platform android가 필요합니다');
    process.exit(1);
  }

  let data = {};
  if (args.file) {
    data = loadJson(args.file);
  } else {
    // CLI 인자에서 업데이트 데이터 생성
    if (args.version) data.minimumVersion = args.version;
    if (args['force-update'] !== undefined) {
      data.forceUpdate = parseBoolean(args['force-update']);
    }
    if (args.message !== undefined) {
      data.message = args.message || null;
    }
  }

  if (Object.keys(data).length === 0) {
    console.error('❌ 업데이트할 필드가 없습니다');
    process.exit(1);
  }

  // updatedAt 항상 갱신
  data.updatedAt = admin.firestore.Timestamp.fromDate(new Date());

  const ref = db.collection('appVersion').doc(platform);
  await ref.set(data, { merge: true });
  
  console.log(`✅ ${platform} 버전 업데이트 완료`);
  if (data.minimumVersion) {
    console.log(`   - 최소 버전: ${data.minimumVersion}`);
  }
  if (data.forceUpdate !== undefined) {
    console.log(`   - 강제 업데이트: ${data.forceUpdate}`);
  }
  if (data.message !== undefined) {
    console.log(`   - 메시지: ${data.message || '(없음)'}`);
  }
}

async function getVersion(args) {
  const { platform } = args;
  
  if (platform) {
    // 특정 플랫폼만 조회
    if (!['ios', 'android'].includes(platform)) {
      console.error('❌ platform은 ios 또는 android여야 합니다');
      process.exit(1);
    }
    
    const doc = await db.collection('appVersion').doc(platform).get();
    if (!doc.exists) {
      console.log(`ℹ️  ${platform} 버전 정보가 없습니다`);
      return;
    }
    
    const data = doc.data();
    console.log(`\n📱 ${platform.toUpperCase()} 버전 정보:`);
    console.log(`   - 최소 버전: ${data.minimumVersion || 'N/A'}`);
    console.log(`   - 강제 업데이트: ${data.forceUpdate ? '✅' : '❌'}`);
    console.log(`   - 메시지: ${data.message || '(없음)'}`);
    if (data.updatedAt) {
      console.log(`   - 업데이트 시간: ${data.updatedAt.toDate().toLocaleString('ko-KR')}`);
    }
  } else {
    // 모든 플랫폼 조회
    const iosDoc = await db.collection('appVersion').doc('ios').get();
    const androidDoc = await db.collection('appVersion').doc('android').get();
    
    console.log('\n📱 앱 버전 정보:');
    
    if (iosDoc.exists) {
      const iosData = iosDoc.data();
      console.log(`\n   iOS:`);
      console.log(`   - 최소 버전: ${iosData.minimumVersion || 'N/A'}`);
      console.log(`   - 강제 업데이트: ${iosData.forceUpdate ? '✅' : '❌'}`);
      console.log(`   - 메시지: ${iosData.message || '(없음)'}`);
      if (iosData.updatedAt) {
        console.log(`   - 업데이트 시간: ${iosData.updatedAt.toDate().toLocaleString('ko-KR')}`);
      }
    } else {
      console.log(`\n   iOS: 버전 정보 없음`);
    }
    
    if (androidDoc.exists) {
      const androidData = androidDoc.data();
      console.log(`\n   Android:`);
      console.log(`   - 최소 버전: ${androidData.minimumVersion || 'N/A'}`);
      console.log(`   - 강제 업데이트: ${androidData.forceUpdate ? '✅' : '❌'}`);
      console.log(`   - 메시지: ${androidData.message || '(없음)'}`);
      if (androidData.updatedAt) {
        console.log(`   - 업데이트 시간: ${androidData.updatedAt.toDate().toLocaleString('ko-KR')}`);
      }
    } else {
      console.log(`\n   Android: 버전 정보 없음`);
    }
  }
  
  console.log('');
}

async function main() {
  const args = parseArgs();
  const { command } = args;
  
  try {
    if (command === 'create') {
      await createVersion(args);
    } else if (command === 'update') {
      await updateVersion(args);
    } else if (command === 'get') {
      await getVersion(args);
    } else {
      console.log('Usage:');
      console.log('\n  초기 생성:');
      console.log('    node scripts/manage-app-version.js create --ios-version 1.0.0 --android-version 1.0.0 --force-update true');
      console.log('    node scripts/manage-app-version.js create --file ./version-config.json');
      console.log('\n  버전 업데이트:');
      console.log('    node scripts/manage-app-version.js update --platform ios --version 1.1.0 --force-update true --message "업데이트 메시지"');
      console.log('    node scripts/manage-app-version.js update --platform android --version 1.1.0 --force-update false');
      console.log('    node scripts/manage-app-version.js update --platform ios --file ./version-update.json');
      console.log('\n  버전 확인:');
      console.log('    node scripts/manage-app-version.js get');
      console.log('    node scripts/manage-app-version.js get --platform ios');
      console.log('\n  예시 JSON 파일 (version-config.json):');
      console.log('    {');
      console.log('      "ios": {');
      console.log('        "minimumVersion": "1.0.0",');
      console.log('        "forceUpdate": true,');
      console.log('        "message": "새로운 기능이 추가되었습니다."');
      console.log('      },');
      console.log('      "android": {');
      console.log('        "minimumVersion": "1.0.0",');
      console.log('        "forceUpdate": true,');
      console.log('        "message": "새로운 기능이 추가되었습니다."');
      console.log('      }');
      console.log('    }');
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ 작업 실패:', err);
    process.exit(1);
  }
}

main();

