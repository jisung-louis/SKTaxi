// SKTaxi: 현재 사용자의 pending 동승 요청 조회 훅 (Repository 패턴 적용)

import { useState, useEffect } from 'react';
import { usePartyRepository } from '../../di/useRepository';
import { useAuth } from '../auth';
import { PendingJoinRequest } from '../../repositories/interfaces/IPartyRepository';

export interface UsePendingJoinRequestResult {
  /** pending 동승 요청 정보 */
  pendingRequest: PendingJoinRequest | null;
  /** 로딩 상태 */
  loading: boolean;
}

/**
 * 현재 사용자의 pending 동승 요청을 조회하는 훅 (Repository 패턴)
 * 실시간 구독으로 상태 변경 감지
 */
export function usePendingJoinRequest(): UsePendingJoinRequestResult {
  const { user } = useAuth();
  const partyRepository = usePartyRepository();
  const [pendingRequest, setPendingRequest] = useState<PendingJoinRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setPendingRequest(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = partyRepository.subscribeToMyPendingJoinRequest(
      user.uid,
      {
        onData: (request) => {
          setPendingRequest(request);
          setLoading(false);
        },
        onError: (error) => {
          console.error('Pending join request subscription error:', error);
          setPendingRequest(null);
          setLoading(false);
        },
      }
    );

    return () => unsubscribe();
  }, [user?.uid, partyRepository]);

  return { pendingRequest, loading };
}
