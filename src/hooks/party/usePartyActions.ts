// SKTaxi: usePartyActions 훅 - Repository 패턴 적용 버전
// 파티 생성, 수정, 삭제, 멤버 관리 액션

import { useCallback, useState } from 'react';
import { Party } from '../../types/party';
import { usePartyRepository } from '../../di';

/**
 * 파티 액션 상태
 */
export interface PartyActionState {
  loading: boolean;
  error: Error | null;
}

/**
 * usePartyActions 훅 반환 타입
 */
export interface UsePartyActionsResult extends PartyActionState {
  /** 파티 생성 */
  createParty: (party: Omit<Party, 'id'>) => Promise<string>;
  /** 파티 업데이트 */
  updateParty: (partyId: string, updates: Partial<Party>) => Promise<void>;
  /** 파티 삭제 (소프트 삭제) */
  deleteParty: (partyId: string, reason: Party['endReason']) => Promise<void>;
  /** 멤버 추가 */
  addMember: (partyId: string, userId: string) => Promise<void>;
  /** 멤버 제거 */
  removeMember: (partyId: string, userId: string) => Promise<void>;
  /** 에러 초기화 */
  clearError: () => void;
}

/**
 * 파티 관련 액션(생성, 수정, 삭제, 멤버 관리)을 제공하는 훅
 *
 * @example
 * const { createParty, loading, error } = usePartyActions();
 *
 * const handleCreate = async () => {
 *   try {
 *     const partyId = await createParty({
 *       leaderId: userId,
 *       departure: { name: '성결대', lat: 37.4, lng: 127.0 },
 *       destination: { name: '강남역', lat: 37.5, lng: 127.0 },
 *       departureTime: new Date().toISOString(),
 *       maxMembers: 4,
 *       members: [userId],
 *       status: 'open',
 *     });
 *     console.log('파티 생성됨:', partyId);
 *   } catch (e) {
 *     console.error('파티 생성 실패:', e);
 *   }
 * };
 */
export function usePartyActions(): UsePartyActionsResult {
  const partyRepository = usePartyRepository();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createParty = useCallback(
    async (party: Omit<Party, 'id'>): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        const partyId = await partyRepository.createParty(party);
        return partyId;
      } catch (e) {
        const err = e as Error;
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [partyRepository]
  );

  const updateParty = useCallback(
    async (partyId: string, updates: Partial<Party>): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await partyRepository.updateParty(partyId, updates);
      } catch (e) {
        const err = e as Error;
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [partyRepository]
  );

  const deleteParty = useCallback(
    async (partyId: string, reason: Party['endReason']): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await partyRepository.deleteParty(partyId, reason);
      } catch (e) {
        const err = e as Error;
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [partyRepository]
  );

  const addMember = useCallback(
    async (partyId: string, userId: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await partyRepository.addMember(partyId, userId);
      } catch (e) {
        const err = e as Error;
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [partyRepository]
  );

  const removeMember = useCallback(
    async (partyId: string, userId: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await partyRepository.removeMember(partyId, userId);
      } catch (e) {
        const err = e as Error;
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [partyRepository]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createParty,
    updateParty,
    deleteParty,
    addMember,
    removeMember,
    clearError,
  };
}
