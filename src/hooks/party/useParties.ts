// SKTaxi: useParties 훅 - Repository 패턴 적용 버전
// DIP 원칙에 따라 IPartyRepository 인터페이스에 의존

import { useCallback } from 'react';
import { Party } from '../../types/party';
import { usePartyRepository } from '../../di';
import { useFirestoreSubscription, SubscriptionState } from '../common';

/**
 * useParties 훅 반환 타입
 */
export interface UsePartiesResult extends SubscriptionState<Party[]> {
  parties: Party[];
}

/**
 * 모든 활성 파티 목록을 실시간 구독하는 훅
 * status가 'ended'가 아닌 파티만 반환
 *
 * @example
 * const { parties, loading, error } = useParties();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <FlatList
 *     data={parties}
 *     renderItem={({ item }) => <PartyCard party={item} />}
 *   />
 * );
 */
export function useParties(): UsePartiesResult {
  const partyRepository = usePartyRepository();

  // Repository의 subscribeToParties를 안정적인 콜백으로 래핑
  const subscribeFn = useCallback(
    (callbacks: { onData: (data: Party[]) => void; onError: (error: Error) => void }) =>
      partyRepository.subscribeToParties(callbacks),
    [partyRepository]
  );

  const { data, loading, error } = useFirestoreSubscription<Party[]>(
    subscribeFn,
    [] // 초기값: 빈 배열
  );

  return {
    parties: data,
    data,
    loading,
    error,
  };
}
