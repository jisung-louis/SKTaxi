import { getFirestore, doc, getDoc, updateDoc, arrayRemove } from '@react-native-firebase/firestore';

/**
 * 학과명을 기반으로 채팅방 문서 ID를 생성합니다.
 * manage-chat-rooms.js와 동일한 규칙을 사용합니다.
 * 
 * @param department 학과명 (예: '컴퓨터공학과')
 * @returns 채팅방 문서 ID (예: 'department-7Lu07ZOo7YSw6rO17ZWZ6rO8')
 */
export function getDepartmentRoomId(department: string): string {
  // React Native에서 UTF-8을 base64로 인코딩
  // TextEncoder를 사용하여 UTF-8 바이트 배열로 변환
  const encoder = new TextEncoder();
  const bytes = encoder.encode(department);
  
  // Base64 인코딩
  let base64 = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1] ?? 0;
    const b3 = bytes[i + 2] ?? 0;
    
    const bitmap = (b1 << 16) | (b2 << 8) | b3;
    
    base64 += chars.charAt((bitmap >> 18) & 63);
    base64 += chars.charAt((bitmap >> 12) & 63);
    base64 += i + 1 < bytes.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    base64 += i + 2 < bytes.length ? chars.charAt(bitmap & 63) : '=';
  }
  
  // URL-safe base64로 변환 (manage-chat-rooms.js와 동일)
  // + -> -, / -> _, = 제거
  const urlSafe = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `department-${urlSafe}`;
}

/**
 * 사용자를 기존 학과 채팅방에서 탈퇴시킵니다.
 * 
 * @param department 기존 학과명
 * @param uid 사용자 UID
 * @returns 성공 여부
 */
export async function leaveDepartmentRoom(department: string, uid: string): Promise<void> {
  if (!department || !uid) {
    console.warn('⚠️ leaveDepartmentRoom: department 또는 uid가 없습니다.');
    return;
  }

  try {
    const docId = getDepartmentRoomId(department);
    const db = getFirestore();
    const roomRef = doc(db, 'chatRooms', docId);

    // 문서 존재 여부 확인 (선택적)
    const docSnap = await getDoc(roomRef);
    if (!docSnap.exists()) {
      console.log(`ℹ️ 채팅방이 존재하지 않습니다: ${docId} (학과: ${department})`);
      return;
    }

    // members 배열에서 uid 제거
    await updateDoc(roomRef, {
      members: arrayRemove(uid),
    });
    
    console.log(`✅ 사용자 ${uid}가 ${department} 채팅방에서 탈퇴했습니다. (docId: ${docId})`);
  } catch (error) {
    // 실패해도 새 학과 저장은 성공해야 하므로 에러를 throw하지 않고 로그만 남김
    console.warn(`⚠️ ${department} 채팅방 탈퇴 실패:`, error);
  }
}

