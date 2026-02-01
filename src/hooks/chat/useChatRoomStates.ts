// SKTaxi: 채팅방 읽음 상태 구독 훅 (Repository 패턴)
// ChatListScreen에서 안 읽은 메시지 계산에 사용

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChatRepository } from '../../di/useRepository';
import { useAuth } from '../auth';
import { ChatRoomStatesMap } from '../../repositories/interfaces/IChatRepository';

export interface UseChatRoomStatesResult {
  /** 채팅방 상태 맵 (chatRoomId -> state) */
  states: ChatRoomStatesMap;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 특정 채팅방 읽음 시간 업데이트 */
  updateLastReadAt: (chatRoomId: string) => Promise<void>;
}

/**
 * 채팅방 읽음 상태 구독 훅
 */
export function useChatRoomStates(): UseChatRoomStatesResult {
  const { user } = useAuth();
  const chatRepository = useChatRepository();

  const [states, setStates] = useState<ChatRoomStatesMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setStates({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    unsubscribeRef.current = chatRepository.subscribeToChatRoomStates(user.uid, {
      onData: (newStates) => {
        setStates(newStates);
        setLoading(false);
      },
      onError: (err) => {
        console.error('채팅방 상태 구독 에러:', err);
        setError(err.message || '채팅방 상태를 불러오지 못했습니다.');
        setLoading(false);
      },
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.uid, chatRepository]);

  const updateLastReadAt = useCallback(
    async (chatRoomId: string) => {
      if (!user?.uid) {return;}
      try {
        await chatRepository.updateLastReadAt(user.uid, chatRoomId);
      } catch (err: any) {
        console.error('읽음 시간 업데이트 실패:', err);
      }
    },
    [user?.uid, chatRepository]
  );

  return {
    states,
    loading,
    error,
    updateLastReadAt,
  };
}
