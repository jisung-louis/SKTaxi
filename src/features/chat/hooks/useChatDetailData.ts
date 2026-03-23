import React from 'react';
import {useIsFocused} from '@react-navigation/native';

import {useAuth} from '@/features/auth';

import {buildChatDetailViewData} from '../application/chatDetailAssembler';

import {useChatActions} from './useChatActions';
import {useChatMessages} from './useChatMessages';
import {useChatRoom, useChatRoomLastRead} from './useChatRoom';

export const useChatDetailData = (chatRoomId: string | undefined) => {
  const {user} = useAuth();
  const isFocused = useIsFocused();
  const {
    chatRoom,
    error: roomError,
    loading: roomLoading,
    refresh: refreshRoom,
  } = useChatRoom(chatRoomId);
  const {
    error: messagesError,
    loading: messagesLoading,
    messages,
    refresh: refreshMessages,
  } = useChatMessages(chatRoomId, Boolean(chatRoomId && chatRoom?.isJoined));
  const {sendMessage: sendChatMessage, updateNotificationSetting} =
    useChatActions();
  const {updateLastRead} = useChatRoomLastRead(
    chatRoomId,
    Boolean(isFocused && chatRoom?.isJoined),
  );

  const data = React.useMemo(() => {
    if (!chatRoom || !chatRoom.isJoined) {
      return null;
    }

    return buildChatDetailViewData({
      currentUserId: user?.uid ?? 'current-user',
      messages,
      room: chatRoom,
    });
  }, [chatRoom, messages, user?.uid]);

  const loading = roomLoading || Boolean(chatRoom?.isJoined && messagesLoading);
  const notFound = Boolean(chatRoomId && !loading && !roomError && !chatRoom);
  const error = React.useMemo(() => {
    if (roomError) {
      return roomError;
    }

    if (chatRoom && chatRoom.isJoined === false) {
      return '참여 중인 채팅방만 메시지를 확인할 수 있습니다.';
    }

    if (messagesError) {
      return messagesError.message || '채팅 메시지를 불러오지 못했습니다.';
    }

    return null;
  }, [chatRoom, messagesError, roomError]);

  const reload = React.useCallback(async () => {
    await refreshRoom();

    if (chatRoomId) {
      await refreshMessages();
    }
  }, [chatRoomId, refreshMessages, refreshRoom]);

  const sendMessage = React.useCallback(
    async (messageText: string) => {
      if (!chatRoomId || !chatRoom?.isJoined) {
        throw new Error('참여 중인 채팅방만 메시지를 전송할 수 있습니다.');
      }

      await sendChatMessage(chatRoomId, messageText, chatRoom);
      await updateLastRead();
    },
    [chatRoom, chatRoomId, sendChatMessage, updateLastRead],
  );

  const toggleNotification = React.useCallback(async () => {
    if (!chatRoomId || !chatRoom?.isJoined) {
      throw new Error('참여 중인 채팅방만 알림 설정을 변경할 수 있습니다.');
    }

    await updateNotificationSetting(
      chatRoomId,
      chatRoom.isMuted === true,
    );
  }, [chatRoom, chatRoomId, updateNotificationSetting]);

  return {
    data,
    error,
    loading,
    notFound,
    reload,
    sendMessage,
    toggleNotification,
  };
};
