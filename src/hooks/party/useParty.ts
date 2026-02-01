// SKTaxi: useParty 훅 - Repository 패턴 적용 버전
// 특정 파티를 실시간 구독

import { useCallback } from 'react';
import { Party } from '../../types/party';
import { usePartyRepository } from '../../di';
import { useFirestoreSubscription, SubscriptionState } from '../common';

/**
 * useParty 훅 반환 타입
 */
export interface UsePartyResult extends SubscriptionState<Party | null> {
  party: Party | null;
}

/**
 * 특정 파티를 실시간 구독하는 훅
 *
 * @param partyId - 조회할 파티 ID
 * @example
 * const { party, loading, error } = useParty(partyId);
 *
 * if (loading) return <Loading />;
 * if (!party) return <NotFound />;
 *
 * return <PartyDetail party={party} />;
 */
export function useParty(partyId: string | undefined): UsePartyResult {
  const partyRepository = usePartyRepository();

  // partyId가 있을 때만 구독하는 콜백 생성
  const subscribeFn = useCallback(
    (callbacks: { onData: (data: Party | null) => void; onError: (error: Error) => void }) => {
      if (!partyId) {
        callbacks.onData(null);
        return () => {};
      }
      return partyRepository.subscribeToParty(partyId, callbacks);
    },
    [partyRepository, partyId]
  );

  const { data, loading, error } = useFirestoreSubscription<Party | null>(
    subscribeFn,
    null,
    !!partyId
  );

  return {
    party: data,
    data,
    loading: partyId ? loading : false,
    error,
  };
}
