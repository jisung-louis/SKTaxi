// SKTaxi: 파티 채팅 메시지 구독 훅
// IPartyRepository를 사용하여 Firebase Firestore 직접 의존 제거

import { useState, useEffect } from 'react';
import type { PartyMessage } from '../model/types';
import { usePartyRepository } from './usePartyRepository';

export interface UseMessagesResult {
  messages: PartyMessage[];
  loading: boolean;
  error: Error | null;
}

/**
 * 파티 채팅 메시지 실시간 구독 훅
 * @param partyId - 파티 ID
 */
export function usePartyMessages(partyId: string | undefined): UseMessagesResult {
  const partyRepository = usePartyRepository();

  const [messages, setMessages] = useState<PartyMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!partyId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = partyRepository.subscribeToPartyMessages(partyId, {
      onData: (fetchedMessages) => {
        setMessages(fetchedMessages);
        setLoading(false);
      },
      onError: (err) => {
        console.error('usePartyMessages: Error fetching messages:', err);
        setError(err);
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [partyId, partyRepository]);

  return { messages, loading, error };
}
