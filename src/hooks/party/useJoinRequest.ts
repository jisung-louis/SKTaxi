// SKTaxi: 동승 요청 액션 훅 (Repository 패턴)
// 동승 요청 생성/취소 기능 제공

import { useCallback } from 'react';
import { usePartyRepository } from '../../di/useRepository';
import { useAuth } from '../auth';

export interface UseJoinRequestResult {
  /**
   * 동승 요청 생성
   * @param partyId - 파티 ID
   * @param leaderId - 파티 리더 ID
   * @returns 생성된 요청 ID
   */
  createJoinRequest: (partyId: string, leaderId: string) => Promise<string>;
  /**
   * 동승 요청 취소
   * @param requestId - 요청 ID
   */
  cancelJoinRequest: (requestId: string) => Promise<void>;
}

/**
 * 동승 요청 액션 훅
 */
export function useJoinRequest(): UseJoinRequestResult {
  const { user } = useAuth();
  const partyRepository = usePartyRepository();

  const createJoinRequest = useCallback(
    async (partyId: string, leaderId: string): Promise<string> => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }
      return partyRepository.createJoinRequest(partyId, leaderId, user.uid);
    },
    [user?.uid, partyRepository]
  );

  const cancelJoinRequest = useCallback(
    async (requestId: string): Promise<void> => {
      return partyRepository.cancelJoinRequest(requestId);
    },
    [partyRepository]
  );

  return {
    createJoinRequest,
    cancelJoinRequest,
  };
}
