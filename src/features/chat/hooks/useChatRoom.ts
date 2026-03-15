import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/features/auth';

import { subscribeToMinecraftServerInfo } from '../data/minecraftChatBridge';
import type { ChatRoom, ChatRoomServerInfo } from '../model/types';

import { useChatRepository } from './useChatRepository';

export interface UseChatRoomResult {
  chatRoom: ChatRoom | null;
  loading: boolean;
  error: string | null;
  hasJoined: boolean;
  joinRoom: () => Promise<void>;
  leaveRoom: () => Promise<void>;
  serverInfo: ChatRoomServerInfo | null;
}

export const useChatRoom = (chatRoomId: string | undefined): UseChatRoomResult => {
  const { user } = useAuth();
  const chatRepository = useChatRepository();

  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [serverInfo, setServerInfo] = useState<ChatRoomServerInfo | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!chatRoomId) {
      setChatRoom(null);
      setHasJoined(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    unsubscribeRef.current = chatRepository.subscribeToChatRoom(chatRoomId, {
      onData: room => {
        setChatRoom(room);
        setHasJoined(Boolean(user?.uid && room?.members?.includes(user.uid)));
        setLoading(false);
      },
      onError: err => {
        console.error('채팅방 정보 구독 에러:', err);
        setError(err.message || '채팅방 정보를 불러오지 못했습니다.');
        setLoading(false);
      },
    });

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [chatRepository, chatRoomId, user?.uid]);

  useEffect(() => {
    if (chatRoom?.type !== 'game') {
      setServerInfo(null);
      return;
    }

    const unsubscribe = subscribeToMinecraftServerInfo({
      onData: nextServerInfo => {
        setServerInfo(nextServerInfo);
      },
      onError: err => {
        console.error('게임 채팅 서버 상태 구독 실패:', err);
        setServerInfo(null);
      },
    });

    return () => unsubscribe();
  }, [chatRoom?.type]);

  const joinRoom = useCallback(async () => {
    if (!chatRoomId || !user?.uid) {
      return;
    }

    await chatRepository.joinChatRoom(chatRoomId, user.uid);
    setHasJoined(true);
  }, [chatRepository, chatRoomId, user?.uid]);

  const leaveRoom = useCallback(async () => {
    if (!chatRoomId || !user?.uid) {
      return;
    }

    await chatRepository.leaveChatRoom(chatRoomId, user.uid);
    setHasJoined(false);
  }, [chatRepository, chatRoomId, user?.uid]);

  return {
    chatRoom,
    loading,
    error,
    hasJoined,
    joinRoom,
    leaveRoom,
    serverInfo,
  };
};

export interface UseChatRoomLastReadResult {
  updateLastRead: () => Promise<void>;
}

export const useChatRoomLastRead = (
  chatRoomId: string | undefined,
  isFocused: boolean,
): UseChatRoomLastReadResult => {
  const { user } = useAuth();
  const chatRepository = useChatRepository();

  const updateLastRead = useCallback(async () => {
    if (!chatRoomId || !user?.uid) {
      return;
    }

    try {
      await chatRepository.updateLastReadAt(user.uid, chatRoomId);
    } catch (err) {
      console.error('채팅방 lastReadAt 업데이트 실패:', err);
    }
  }, [chatRepository, chatRoomId, user?.uid]);

  useEffect(() => {
    if (!chatRoomId || !user?.uid || !isFocused) {
      return;
    }

    updateLastRead();

    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        updateLastRead();
      }
    });

    return () => {
      subscription.remove();
      updateLastRead();
    };
  }, [chatRoomId, isFocused, updateLastRead, user?.uid]);

  return { updateLastRead };
};
