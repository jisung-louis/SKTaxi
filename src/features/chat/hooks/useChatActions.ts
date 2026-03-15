import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth';
import { useUserRepository } from '@/features/user';

import type { ChatRoom } from '../model/types';
import {
  sendChatSystemMessage,
  sendChatTextMessage,
} from '../services/chatRoomService';

import { useChatRepository } from './useChatRepository';

export interface UseChatActionsResult {
  sendMessage: (
    chatRoomId: string,
    text: string,
    chatRoom?: ChatRoom | null,
  ) => Promise<void>;
  sendSystemMessage: (chatRoomId: string, text: string) => Promise<void>;
  sending: boolean;
  sendError: Error | null;
  joinRoom: (chatRoomId: string) => Promise<void>;
  leaveRoom: (chatRoomId: string) => Promise<void>;
  getNotificationSetting: (chatRoomId: string) => Promise<boolean>;
  updateNotificationSetting: (chatRoomId: string, enabled: boolean) => Promise<void>;
}

export const useChatActions = (): UseChatActionsResult => {
  const chatRepository = useChatRepository();
  const userRepository = useUserRepository();
  const { user } = useAuth();

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (chatRoomId: string, text: string, chatRoom?: ChatRoom | null) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      try {
        setSending(true);
        setSendError(null);

        await sendChatTextMessage({
          chatRepository,
          chatRoom,
          chatRoomId,
          text,
          userEmail: user.email,
          userId: user.uid,
          userRepository,
        });
      } catch (err) {
        console.error('메시지 전송 실패:', err);
        setSendError(err as Error);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [chatRepository, user, userRepository],
  );

  const sendSystemMessage = useCallback(
    async (chatRoomId: string, text: string) => {
      await sendChatSystemMessage({ chatRepository, chatRoomId, text });
    },
    [chatRepository],
  );

  const joinRoom = useCallback(
    async (chatRoomId: string) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      await chatRepository.joinChatRoom(chatRoomId, user.uid);
    },
    [chatRepository, user?.uid],
  );

  const leaveRoom = useCallback(
    async (chatRoomId: string) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      await chatRepository.leaveChatRoom(chatRoomId, user.uid);
    },
    [chatRepository, user?.uid],
  );

  const getNotificationSetting = useCallback(
    async (chatRoomId: string) => {
      if (!user?.uid) {
        return true;
      }

      return chatRepository.getNotificationSetting(chatRoomId, user.uid);
    },
    [chatRepository, user?.uid],
  );

  const updateNotificationSetting = useCallback(
    async (chatRoomId: string, enabled: boolean) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      await chatRepository.updateNotificationSetting(chatRoomId, user.uid, enabled);
    },
    [chatRepository, user?.uid],
  );

  return {
    sendMessage,
    sendSystemMessage,
    sending,
    sendError,
    joinRoom,
    leaveRoom,
    getNotificationSetting,
    updateNotificationSetting,
  };
};
