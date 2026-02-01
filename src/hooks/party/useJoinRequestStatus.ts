// SKTaxi: 동승 요청 상태 관리 훅 (Repository 패턴 적용)

import { useState, useEffect, useCallback } from 'react';
import { usePartyRepository } from '../../di/useRepository';
import { JoinRequestStatus } from '../../repositories/interfaces/IPartyRepository';

export interface UseJoinRequestStatusResult {
  /** 요청 상태 정보 */
  requestStatus: JoinRequestStatus | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 요청 취소 */
  cancelRequest: () => Promise<void>;
}

/**
 * 동승 요청 상태를 관리하는 훅 (Repository 패턴)
 * 요청 상태 실시간 구독 및 취소 기능 제공
 */
export function useJoinRequestStatus(requestId: string | undefined): UseJoinRequestStatusResult {
  const partyRepository = usePartyRepository();
  const [requestStatus, setRequestStatus] = useState<JoinRequestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 요청 상태 실시간 구독
  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = partyRepository.subscribeToJoinRequest(requestId, {
      onData: (status) => {
        setRequestStatus(status);
        setLoading(false);
      },
      onError: (err) => {
        console.error('동승 요청 상태 구독 실패:', err);
        setError('요청 상태를 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [requestId, partyRepository]);

  // 요청 취소
  const cancelRequest = useCallback(async () => {
    if (!requestId) {
      throw new Error('요청 ID가 없습니다.');
    }

    try {
      setError(null);
      await partyRepository.cancelJoinRequest(requestId);
    } catch (err) {
      const message = err instanceof Error ? err.message : '요청 취소에 실패했습니다.';
      setError(message);
      throw new Error(message);
    }
  }, [requestId, partyRepository]);

  return {
    requestStatus,
    loading,
    error,
    cancelRequest,
  };
}
