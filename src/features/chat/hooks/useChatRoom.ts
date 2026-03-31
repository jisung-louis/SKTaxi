import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/features/auth';
import {MINECRAFT_CHAT_ROOM_ID} from '@/features/minecraft/constants/minecraftGuide';

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
  refresh: () => Promise<void>;
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
  const [reloadToken, setReloadToken] = useState(0);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(async () => {
    setReloadToken(currentValue => currentValue + 1);
  }, []);

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
        setHasJoined(
          Boolean(
            room?.isJoined ??
              (user?.uid ? room?.members?.includes(user.uid) : false),
          ),
        );
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
  }, [chatRepository, chatRoomId, reloadToken, user?.uid]);

  useEffect(() => {
    if (chatRoom?.id !== MINECRAFT_CHAT_ROOM_ID) {
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
  }, [chatRoom?.id]);

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
    refresh,
    serverInfo,
  };
};

export interface UseChatRoomLastReadResult {
  updateLastRead: () => Promise<void>;
  skipNextCleanupRead: () => void;
}

export const useChatRoomLastRead = (
  chatRoomId: string | undefined,
  isFocused: boolean,
  isJoined: boolean,
): UseChatRoomLastReadResult => {
  const { user } = useAuth();
  const chatRepository = useChatRepository();
  const skipNextCleanupReadRef = useRef(false);
  const isJoinedRef = useRef(isJoined);

  useEffect(() => {
    isJoinedRef.current = isJoined;
  }, [isJoined]);

  const updateLastRead = useCallback(async () => {
    if (!chatRoomId || !user?.uid || !isJoinedRef.current) {
      return;
    }

    try {
      await chatRepository.updateLastReadAt(user.uid, chatRoomId);
    } catch (err) {
      console.error('채팅방 lastReadAt 업데이트 실패:', err);
    }
  }, [chatRepository, chatRoomId, user?.uid]);

  const skipNextCleanupRead = useCallback(() => {
    skipNextCleanupReadRef.current = true;
  }, []);

  useEffect(() => {
    if (!chatRoomId || !user?.uid || !isFocused || !isJoined) {
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
      if (skipNextCleanupReadRef.current) {
        skipNextCleanupReadRef.current = false;
        return;
      }
      updateLastRead();
    };
  }, [chatRoomId, isFocused, isJoined, updateLastRead, user?.uid]);

  return { updateLastRead, skipNextCleanupRead };
};
