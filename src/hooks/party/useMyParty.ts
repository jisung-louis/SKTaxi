// SKTaxi: useMyParty 훅 - Repository 패턴 적용 버전
// 현재 사용자가 참여 중인 파티를 실시간 구독

import { useCallback } from 'react';
import { Party } from '../../types/party';
import { usePartyRepository } from '../../di';
import { useFirestoreSubscription, SubscriptionState } from '../common';
import { useAuth } from '../auth';

/**
 * useMyParty 훅 반환 타입
 */
export interface UseMyPartyResult extends SubscriptionState<Party | null> {
  myParty: Party | null;
  /** 파티에 참여 중인지 여부 */
  isInParty: boolean;
  /** 파티 리더인지 여부 */
  isLeader: boolean;
  /** @deprecated isInParty 사용 권장 - 하위 호환성용 */
  hasParty: boolean;
  /** @deprecated myParty?.id 사용 권장 - 하위 호환성용 */
  partyId: string | null;
}

/**
 * 현재 사용자가 참여 중인 파티를 실시간 구독하는 훅
 * 사용자가 로그인하지 않았거나 파티에 참여하지 않은 경우 null 반환
 *
 * @example
 * const { myParty, isInParty, isLeader, loading, error } = useMyParty();
 *
 * if (loading) return <Loading />;
 * if (!isInParty) return <JoinPartyButton />;
 *
 * return <PartyDetail party={myParty} isLeader={isLeader} />;
 */
export function useMyParty(): UseMyPartyResult {
  const partyRepository = usePartyRepository();
  const { user } = useAuth();

  const userId = user?.uid;

  // userId가 있을 때만 구독하는 콜백 생성
  const subscribeFn = useCallback(
    (callbacks: { onData: (data: Party | null) => void; onError: (error: Error) => void }) => {
      if (!userId) {
        // 로그인하지 않은 경우 즉시 null 반환
        callbacks.onData(null);
        return () => {};
      }
      return partyRepository.subscribeToMyParty(userId, callbacks);
    },
    [partyRepository, userId]
  );

  const { data, loading, error } = useFirestoreSubscription<Party | null>(
    subscribeFn,
    null, // 초기값: null
    !!userId // userId가 있을 때만 활성화
  );

  // 파티 참여 여부와 리더 여부 계산
  const isInParty = data !== null && data.status !== 'ended';
  const isLeader = isInParty && data?.leaderId === userId;

  return {
    myParty: data,
    data,
    loading: userId ? loading : false, // 로그인 안 했으면 로딩 아님
    error,
    isInParty,
    isLeader,
    // 하위 호환성용 속성
    hasParty: isInParty,
    partyId: data?.id ?? null,
  };
}
