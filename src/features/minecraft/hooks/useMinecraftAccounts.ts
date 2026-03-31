import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';

import { minecraftRepository } from '../data/composition/minecraftRuntime';
import type { MinecraftAccountEntry, MinecraftEdition } from '../model/types';
import {
  deleteMinecraftAccount as deleteMinecraftAccountService,
  registerMinecraftAccount as registerMinecraftAccountService,
} from '../services/minecraftAccountService';

export interface UseMinecraftAccountsResult {
  accounts: MinecraftAccountEntry[];
  loading: boolean;
  registering: boolean;
  error: string | null;
  registerAccount: (
    nickname: string,
    edition: MinecraftEdition,
    whoseFriend?: string,
  ) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useMinecraftAccounts = (): UseMinecraftAccountsResult => {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState<MinecraftAccountEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!user?.uid) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const nextAccounts = await minecraftRepository.getUserMinecraftAccounts(
        user.uid,
      );
      setAccounts(nextAccounts);
    } catch (nextError: any) {
      console.error('마인크래프트 계정 조회 실패:', nextError);
      setError('마인크래프트 계정 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const registerAccount = useCallback(
    async (
      nickname: string,
      edition: MinecraftEdition,
      whoseFriend?: string,
    ) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      try {
        setRegistering(true);
        setError(null);
        await registerMinecraftAccountService({
          uid: user.uid,
          nickname,
          edition,
          whoseFriend,
        });
        await loadAccounts();
      } catch (nextError: any) {
        const message =
          typeof nextError?.message === 'string'
            ? nextError.message
            : '계정 등록 중 오류가 발생했습니다.';
        setError(message);
        throw nextError;
      } finally {
        setRegistering(false);
      }
    },
    [loadAccounts, user?.uid],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      try {
        setRegistering(true);
        setError(null);
        await deleteMinecraftAccountService({
          uid: user.uid,
          accountId,
        });
        await loadAccounts();
      } catch (nextError: any) {
        const message =
          typeof nextError?.message === 'string'
            ? nextError.message
            : '계정 삭제 중 오류가 발생했습니다.';
        setError(message);
        throw nextError;
      } finally {
        setRegistering(false);
      }
    },
    [loadAccounts, user?.uid],
  );

  return {
    accounts,
    loading,
    registering,
    error,
    registerAccount,
    deleteAccount,
    refresh: loadAccounts,
  };
};
