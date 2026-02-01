// SKTaxi: 채팅 액션 훅 - Repository 패턴 적용
// 메시지 전송, 채팅방 참여/나가기, 알림 설정 등

import { useCallback, useState } from 'react';
import { useChatRepository, useUserRepository } from '../../di';
import { useAuth } from '../auth';
import { ChatMessage } from '../../types/firestore';

export interface UseChatActionsResult {
  // 메시지 전송
  sendMessage: (chatRoomId: string, text: string) => Promise<void>;
  sending: boolean;
  sendError: Error | null;

  // 채팅방 참여/나가기
  joinRoom: (chatRoomId: string) => Promise<void>;
  leaveRoom: (chatRoomId: string) => Promise<void>;

  // 알림 설정
  getNotificationSetting: (chatRoomId: string) => Promise<boolean>;
  updateNotificationSetting: (chatRoomId: string, enabled: boolean) => Promise<void>;
}

/**
 * 채팅 액션 훅 - Repository 패턴 사용
 */
export function useChatActions(): UseChatActionsResult {
  const chatRepository = useChatRepository();
  const userRepository = useUserRepository();
  const { user } = useAuth();

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);

  // 메시지 전송
  const sendMessage = useCallback(
    async (chatRoomId: string, text: string) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      if (!text.trim()) {
        throw new Error('메시지를 입력해주세요.');
      }

      try {
        setSending(true);
        setSendError(null);

        // 사용자 프로필에서 displayName 가져오기
        const profile = await userRepository.getUserProfile(user.uid);
        const senderName = profile?.displayName || user.email || '익명';

        const messageData: Omit<ChatMessage, 'id' | 'createdAt'> = {
          text: text.trim(),
          senderId: user.uid,
          senderName,
          type: 'text',
          clientCreatedAt: new Date(),
        };

        await chatRepository.sendMessage(chatRoomId, messageData);
      } catch (err) {
        console.error('메시지 전송 실패:', err);
        setSendError(err as Error);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [chatRepository, userRepository, user]
  );

  // 채팅방 참여
  const joinRoom = useCallback(
    async (chatRoomId: string) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      await chatRepository.joinChatRoom(chatRoomId, user.uid);
    },
    [chatRepository, user]
  );

  // 채팅방 나가기
  const leaveRoom = useCallback(
    async (chatRoomId: string) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      await chatRepository.leaveChatRoom(chatRoomId, user.uid);
    },
    [chatRepository, user]
  );

  // 알림 설정 조회
  const getNotificationSetting = useCallback(
    async (chatRoomId: string) => {
      if (!user?.uid) {return true;}
      return chatRepository.getNotificationSetting(chatRoomId, user.uid);
    },
    [chatRepository, user]
  );

  // 알림 설정 변경
  const updateNotificationSetting = useCallback(
    async (chatRoomId: string, enabled: boolean) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      await chatRepository.updateNotificationSetting(chatRoomId, user.uid, enabled);
    },
    [chatRepository, user]
  );

  return {
    sendMessage,
    sending,
    sendError,
    joinRoom,
    leaveRoom,
    getNotificationSetting,
    updateNotificationSetting,
  };
}
