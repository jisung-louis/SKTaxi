/*
  채팅방 관리 스크립트
  
  Usage:
  - Create all: node scripts/manage-chat-rooms.js create-all
  - Create university: node scripts/manage-chat-rooms.js create-university
  - Create departments: node scripts/manage-chat-rooms.js create-departments
  - List: node scripts/manage-chat-rooms.js list
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

// 학과 목록 (constants.ts와 동일)
const DEPARTMENT_OPTIONS = [
  '신학과',
  '기독교교육상담학과',
  '문화선교학과',
  '영어영문학과',
  '중어중문학과',
  '국어국문학과',
  '사회복지학과',
  '국제개발협력학과',
  '행정학과',
  '관광학과',
  '경영학과',
  '글로벌물류학과',
  '산업경영공학과',
  '유아교육과',
  '체육교육과',
  '교직부',
  '컴퓨터공학과',
  '정보통신공학과',
  '미디어소프트웨어학과',
  '도시디자인정보공학과',
  '음악학부',
  '실용음악과',
  '공연음악예술학부',
  '연기예술학과',
  '영화영상학과',
  '연극영화학부',
  '뷰티디자인학과',
  '융합학부',
  '파이데이아학부',
];

const GAME_CHAT_ROOMS = [
  {
    id: 'game-minecraft',
    name: '마인크래프트 채팅방',
    description: '마인크래프트 유저들을 위한 채팅방입니다.',
  },
];

// 성결대 전체 채팅방 생성
async function createUniversityChatRoom() {
  try {
    console.log('🚀 성결대 전체 채팅방 생성 시작...');
    
    const now = admin.firestore.Timestamp.now();
    const chatRoomData = {
      name: '성결대 전체 채팅방',
      type: 'university',
      description: '성결대학교 전체 학생 채팅방입니다.',
      createdBy: 'system', // 시스템 생성
      members: [], // 모든 사용자가 접근 가능하므로 빈 배열 (isPublic으로 제어)
      isPublic: true,
      createdAt: now,
      updatedAt: now,
    };
    
    // 고정 ID 사용 (중복 생성 방지)
    const docRef = db.collection('chatRooms').doc('university-main');
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      console.log('⚠️  성결대 전체 채팅방이 이미 존재합니다.');
      const existing = docSnap.data();
      console.log(`   ID: ${docRef.id}`);
      console.log(`   이름: ${existing.name}`);
      console.log(`   생성일: ${existing.createdAt?.toDate?.()?.toLocaleString('ko-KR') || 'N/A'}`);
      return;
    }
    
    await docRef.set(chatRoomData);
    
    console.log('✅ 성결대 전체 채팅방 생성 완료!');
    console.log(`   ID: ${docRef.id}`);
    console.log(`   이름: ${chatRoomData.name}`);
    console.log(`   타입: ${chatRoomData.type}`);
    console.log(`   공개: ${chatRoomData.isPublic}`);
    
  } catch (error) {
    console.error('❌ 성결대 전체 채팅방 생성 실패:', error);
    throw error;
  }
}

// 학과별 채팅방 생성
async function createDepartmentChatRooms() {
  try {
    console.log('🚀 학과별 채팅방 생성 시작...');
    console.log(`📚 총 ${DEPARTMENT_OPTIONS.length}개 학과`);
    
    const batch = db.batch();
    let createdCount = 0;
    let existingCount = 0;
    const now = admin.firestore.Timestamp.now();
    
    for (const department of DEPARTMENT_OPTIONS) {
      const chatRoomData = {
        name: `${department} 채팅방`,
        type: 'department',
        department: department,
        description: `${department} 학생들을 위한 채팅방입니다.`,
        createdBy: 'system',
        members: [],
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      };
      
      // 학과명 기반 고정 ID 생성 (base64 URL-safe 인코딩으로 한글 문제 해결)
      const departmentBase64 = Buffer.from(department, 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      const docId = `department-${departmentBase64}`;
      const docRef = db.collection('chatRooms').doc(docId);
      
      // 존재 여부 확인
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        console.log(`⚠️  ${department} 채팅방이 이미 존재합니다.`);
        existingCount++;
        continue;
      }
      
      batch.set(docRef, chatRoomData);
      createdCount++;
      console.log(`   ✅ ${department} 채팅방 생성 예정`);
    }
    
    if (createdCount > 0) {
      await batch.commit();
      console.log(`\n✅ 학과별 채팅방 생성 완료!`);
      console.log(`   - 새로 생성: ${createdCount}개`);
      console.log(`   - 이미 존재: ${existingCount}개`);
    } else {
      console.log(`\n⚠️  모든 학과 채팅방이 이미 존재합니다.`);
      console.log(`   - 이미 존재: ${existingCount}개`);
    }
    
  } catch (error) {
    console.error('❌ 학과별 채팅방 생성 실패:', error);
    throw error;
  }
}

// 게임 채팅방 생성
async function createGameChatRooms() {
  try {
    console.log('🎮 게임 채팅방 생성 시작...');

    const now = admin.firestore.Timestamp.now();
    let createdCount = 0;
    let existingCount = 0;

    for (const room of GAME_CHAT_ROOMS) {
      const docRef = db.collection('chatRooms').doc(room.id);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        console.log(`⚠️  ${room.name}이 이미 존재합니다.`);
        existingCount++;
        continue;
      }

      await docRef.set({
        name: room.name,
        type: 'game',
        description: room.description,
        createdBy: 'system',
        members: [],
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      });

      console.log(`   ✅ ${room.name} 생성 완료`);
      createdCount++;
    }

    if (createdCount === 0) {
      console.log(`\n⚠️  생성할 게임 채팅방이 없습니다. (이미 존재: ${existingCount}개)`);
    } else {
      console.log(`\n✅ 게임 채팅방 생성 완료!`);
      console.log(`   - 새로 생성: ${createdCount}개`);
      console.log(`   - 이미 존재: ${existingCount}개`);
    }
  } catch (error) {
    console.error('❌ 게임 채팅방 생성 실패:', error);
    throw error;
  }
}

// 모든 채팅방 생성 (전체 + 학과)
async function createAllChatRooms() {
  try {
    console.log('🚀 모든 채팅방 생성 시작...\n');
    
    await createUniversityChatRoom();
    console.log('');
    await createDepartmentChatRooms();
    console.log('');
    await createGameChatRooms();
    
    console.log('\n🎉 모든 채팅방 생성 완료!');
    
  } catch (error) {
    console.error('❌ 채팅방 생성 실패:', error);
    process.exit(1);
  }
}

// 기존 한글 문서 ID를 가진 채팅방 삭제 (마이그레이션용)
async function deleteOldChatRooms() {
  try {
    console.log('🗑️  기존 한글 문서 ID 채팅방 삭제 시작...\n');
    
    const snapshot = await db.collection('chatRooms')
      .where('type', '==', 'department')
      .get();
    
    let deletedCount = 0;
    const batch = db.batch();
    
    snapshot.forEach((doc) => {
      const docId = doc.id;
      // 한글이 포함된 문서 ID 찾기 (정규식으로 한글 체크)
      if (/[가-힣]/.test(docId)) {
        console.log(`   🗑️  삭제 예정: ${docId}`);
        batch.delete(doc.ref);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      await batch.commit();
      console.log(`\n✅ ${deletedCount}개 채팅방 삭제 완료!`);
    } else {
      console.log('\n✅ 삭제할 채팅방이 없습니다.');
    }
  } catch (error) {
    console.error('❌ 채팅방 삭제 실패:', error);
    throw error;
  }
}

// 채팅방 목록 조회
async function listChatRooms() {
  try {
    console.log('📋 채팅방 목록 조회 중...\n');
    
    const snapshot = await db.collection('chatRooms').get();
    
    if (snapshot.empty) {
      console.log('⚠️  채팅방이 없습니다.');
      return;
    }
    
    const rooms = {
      university: [],
      department: [],
      game: [],
      custom: [],
    };
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const room = {
        id: doc.id,
        name: data.name,
        type: data.type,
        department: data.department || '-',
        members: data.members?.length || 0,
        isPublic: data.isPublic,
        createdAt: data.createdAt?.toDate?.()?.toLocaleString('ko-KR') || 'N/A',
      };
      
      if (data.type === 'university') {
        rooms.university.push(room);
      } else if (data.type === 'department') {
        rooms.department.push(room);
      } else if (data.type === 'game') {
        rooms.game.push(room);
      } else {
        rooms.custom.push(room);
      }
    });
    
    console.log(`📊 총 ${snapshot.size}개 채팅방\n`);
    
    if (rooms.university.length > 0) {
      console.log('🏫 전체 채팅방:');
      rooms.university.forEach((room, index) => {
        console.log(`   ${index + 1}. ${room.name} (${room.id})`);
        console.log(`      멤버: ${room.members}명, 공개: ${room.isPublic ? '예' : '아니오'}`);
      });
      console.log('');
    }
    
    if (rooms.department.length > 0) {
      console.log(`🎓 학과 채팅방 (${rooms.department.length}개):`);
      rooms.department.forEach((room, index) => {
        console.log(`   ${index + 1}. ${room.name} (${room.department})`);
        console.log(`      멤버: ${room.members}명, 공개: ${room.isPublic ? '예' : '아니오'}`);
      });
      console.log('');
    }

    if (rooms.game.length > 0) {
      console.log(`🎮 게임 채팅방 (${rooms.game.length}개):`);
      rooms.game.forEach((room, index) => {
        console.log(`   ${index + 1}. ${room.name} (${room.id})`);
        console.log(`      멤버: ${room.members}명, 공개: ${room.isPublic ? '예' : '아니오'}`);
      });
      console.log('');
    }
    
    if (rooms.custom.length > 0) {
      console.log(`💬 커스텀 채팅방 (${rooms.custom.length}개):`);
      rooms.custom.forEach((room, index) => {
        console.log(`   ${index + 1}. ${room.name} (${room.id})`);
        console.log(`      멤버: ${room.members}명, 공개: ${room.isPublic ? '예' : '아니오'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 채팅방 목록 조회 실패:', error);
    process.exit(1);
  }
}

// 마이그레이션: 기존 한글 문서 ID 삭제 후 새로 생성
async function migrateChatRooms() {
  try {
    console.log('🔄 채팅방 마이그레이션 시작...\n');
    
    await deleteOldChatRooms();
    console.log('');
    await createAllChatRooms();
    
    console.log('\n🎉 마이그레이션 완료!');
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  }
}

// 메인 실행
const command = process.argv[2];

if (command === 'create-all') {
  createAllChatRooms().then(() => process.exit(0));
} else if (command === 'create-university') {
  createUniversityChatRoom().then(() => process.exit(0));
} else if (command === 'create-departments') {
  createDepartmentChatRooms().then(() => process.exit(0));
} else if (command === 'create-games') {
  createGameChatRooms().then(() => process.exit(0));
} else if (command === 'list') {
  listChatRooms().then(() => process.exit(0));
} else if (command === 'migrate') {
  migrateChatRooms().then(() => process.exit(0));
} else if (command === 'delete-old') {
  deleteOldChatRooms().then(() => process.exit(0));
} else {
  console.log('사용법:');
  console.log('  node scripts/manage-chat-rooms.js create-all          # 모든 채팅방 생성');
  console.log('  node scripts/manage-chat-rooms.js create-university     # 전체 채팅방만 생성');
  console.log('  node scripts/manage-chat-rooms.js create-departments    # 학과 채팅방만 생성');
  console.log('  node scripts/manage-chat-rooms.js create-games          # 게임 채팅방만 생성');
  console.log('  node scripts/manage-chat-rooms.js list                 # 채팅방 목록 조회');
  console.log('  node scripts/manage-chat-rooms.js migrate               # 기존 한글 문서 ID 삭제 후 새로 생성');
  console.log('  node scripts/manage-chat-rooms.js delete-old            # 기존 한글 문서 ID 채팅방만 삭제');
  process.exit(1);
}

