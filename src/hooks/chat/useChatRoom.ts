// SKTaxi: 단일 채팅방 구독 훅 (Repository 패턴)
// ChatDetailScreen에서 채팅방 정보 실시간 구독에 사용

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useChatRepository } from '../../di/useRepository';
import { useAuth } from '../auth';
import { ChatRoom } from '../../types/firestore';

export interface UseChatRoomResult {
  /** 채팅방 정보 */
  chatRoom: ChatRoom | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 사용자가 채팅방에 참여했는지 여부 */
  hasJoined: boolean;
  /** 채팅방 참여 */
  joinRoom: () => Promise<void>;
  /** 채팅방 나가기 */
  leaveRoom: () => Promise<void>;
}

/**
 * 단일 채팅방 구독 훅
 */
export function useChatRoom(chatRoomId: string | undefined): UseChatRoomResult {
  const { user } = useAuth();
  const chatRepository = useChatRepository();

  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // 채팅방 구독
  useEffect(() => {
    if (!chatRoomId) {
      setChatRoom(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    unsubscribeRef.current = chatRepository.subscribeToChatRoom(chatRoomId, {
      onData: (room) => {
        setChatRoom(room);
        setLoading(false);

        // 사용자가 멤버인지 확인
        if (user?.uid && room?.members?.includes(user.uid)) {
          setHasJoined(true);
        }
      },
      onError: (err) => {
        console.error('채팅방 정보 구독 에러:', err);
        setError(err.message || '채팅방 정보를 불러오지 못했습니다.');
        setLoading(false);
      },
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [chatRoomId, user?.uid, chatRepository]);

  // 채팅방 참여
  const joinRoom = useCallback(async () => {
    if (!chatRoomId || !user?.uid) {return;}
    try {
      await chatRepository.joinChatRoom(chatRoomId, user.uid);
      setHasJoined(true);
    } catch (err: any) {
      console.error('채팅방 참여 실패:', err);
      throw err;
    }
  }, [chatRoomId, user?.uid, chatRepository]);

  // 채팅방 나가기
  const leaveRoom = useCallback(async () => {
    if (!chatRoomId || !user?.uid) {return;}
    try {
      await chatRepository.leaveChatRoom(chatRoomId, user.uid);
      setHasJoined(false);
    } catch (err: any) {
      console.error('채팅방 나가기 실패:', err);
      throw err;
    }
  }, [chatRoomId, user?.uid, chatRepository]);

  return {
    chatRoom,
    loading,
    error,
    hasJoined,
    joinRoom,
    leaveRoom,
  };
}

export interface UseChatRoomLastReadResult {
  /** 읽음 상태 업데이트 */
  updateLastRead: () => Promise<void>;
}

/**
 * 채팅방 읽음 상태 자동 업데이트 훅
 * 포커스 획득/해제 및 앱 상태 변경 시 자동으로 lastReadAt 업데이트
 */
export function useChatRoomLastRead(
  chatRoomId: string | undefined,
  isFocused: boolean
): UseChatRoomLastReadResult {
  const { user } = useAuth();
  const chatRepository = useChatRepository();

  const updateLastRead = useCallback(async () => {
    if (!chatRoomId || !user?.uid) {return;}
    try {
      await chatRepository.updateLastReadAt(user.uid, chatRoomId);
    } catch (err) {
      console.error('채팅방 lastReadAt 업데이트 실패:', err);
    }
  }, [chatRoomId, user?.uid, chatRepository]);

  // 포커스 및 앱 상태 변경 시 lastReadAt 업데이트
  useEffect(() => {
    if (!chatRoomId || !user?.uid || !isFocused) {return;}

    // 포커스 획득 시 업데이트
    updateLastRead();

    // 앱 상태 변경 리스너
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        updateLastRead();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 클린업 (포커스 해제 시)
    return () => {
      subscription.remove();
      updateLastRead();
    };
  }, [chatRoomId, user?.uid, isFocused, updateLastRead]);

  return { updateLastRead };
}
