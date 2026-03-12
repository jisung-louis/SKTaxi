import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth';

import type { ChatRoomStatesMap } from '../model/types';

import { useChatRepository } from './useChatRepository';

export interface UseChatRoomStatesResult {
  states: ChatRoomStatesMap;
  loading: boolean;
  error: string | null;
  updateLastReadAt: (chatRoomId: string) => Promise<void>;
}

export const useChatRoomStates = (): UseChatRoomStatesResult => {
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
      onData: nextStates => {
        setStates(nextStates);
        setLoading(false);
      },
      onError: err => {
        console.error('채팅방 상태 구독 에러:', err);
        setError(err.message || '채팅방 상태를 불러오지 못했습니다.');
        setLoading(false);
      },
    });

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [chatRepository, user?.uid]);

  const updateLastReadAt = useCallback(
    async (chatRoomId: string) => {
      if (!user?.uid) {
        return;
      }

      try {
        await chatRepository.updateLastReadAt(user.uid, chatRoomId);
      } catch (err) {
        console.error('읽음 시간 업데이트 실패:', err);
      }
    },
    [chatRepository, user?.uid],
  );

  return {
    states,
    loading,
    error,
    updateLastReadAt,
  };
};
