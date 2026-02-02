// SKTaxi: 채팅방 유틸리티 함수
// IChatRepository를 사용하여 Firebase Firestore 직접 의존 제거

import { getAuth } from '@react-native-firebase/auth';
import { FirestoreChatRepository } from '../repositories/firestore/FirestoreChatRepository';

// 싱글톤 Repository 인스턴스 (DI Provider 외부에서 사용하기 위함)
const chatRepository = new FirestoreChatRepository();

/**
 * 채팅방 메시지 전송
 * @param chatRoomId - 채팅방 ID
 * @param text - 메시지 텍스트
 */
export async function sendChatMessage(
  chatRoomId: string,
  text: string
): Promise<void> {
  const user = getAuth().currentUser;

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  if (!text.trim()) {
    throw new Error('메시지를 입력해주세요.');
  }

  try {
    // 사용자 정보 조회
    const { getFirestore, doc, getDoc } = await import('@react-native-firebase/firestore');
    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    const senderName = userData?.displayName || userData?.email || '익명';

    await chatRepository.sendMessage(chatRoomId, {
      senderId: user.uid,
      senderName,
      text: text.trim(),
      type: 'text',
    });
  } catch (error) {
    console.error('채팅 메시지 전송 실패:', error);
    throw error;
  }
}

/**
 * 채팅방 시스템 메시지 전송
 * @param chatRoomId - 채팅방 ID
 * @param text - 메시지 텍스트
 */
export async function sendChatSystemMessage(
  chatRoomId: string,
  text: string
): Promise<void> {
  try {
    await chatRepository.sendMessage(chatRoomId, {
      senderId: 'system',
      senderName: '시스템',
      text,
      type: 'system',
    });
  } catch (error) {
    console.error('시스템 메시지 전송 실패:', error);
    throw error;
  }
}

/**
 * 채팅방 참여
 * @param chatRoomId - 채팅방 ID
 * @param userId - 사용자 ID
 */
export async function joinChatRoom(chatRoomId: string, userId: string): Promise<void> {
  try {
    await chatRepository.joinChatRoom(chatRoomId, userId);
  } catch (error) {
    console.error('채팅방 참여 실패:', error);
    throw error;
  }
}

/**
 * 채팅방 알림 설정 조회
 * @param chatRoomId - 채팅방 ID
 * @param userId - 사용자 ID
 * @returns 알림 활성화 여부
 */
export async function getChatRoomNotificationSetting(
  chatRoomId: string,
  userId: string
): Promise<boolean> {
  try {
    return await chatRepository.getNotificationSetting(chatRoomId, userId);
  } catch (error) {
    console.error('알림 설정 조회 실패:', error);
    return true; // 기본값: 알림 활성화
  }
}

/**
 * 채팅방 알림 설정 변경
 * @param chatRoomId - 채팅방 ID
 * @param userId - 사용자 ID
 * @param enabled - 알림 활성화 여부
 */
export async function updateChatRoomNotificationSetting(
  chatRoomId: string,
  userId: string,
  enabled: boolean
): Promise<void> {
  try {
    await chatRepository.updateNotificationSetting(chatRoomId, userId, enabled);
  } catch (error) {
    console.error('알림 설정 변경 실패:', error);
    throw error;
  }
}
