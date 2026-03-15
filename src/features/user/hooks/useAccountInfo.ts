import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';

import { UserAccountInfo } from '../model/types';
import {
  deleteUserAccountInfo,
  resolveUserAccountInfo,
  saveUserAccountInfo,
} from '../services/userProfileService';
import { useUserRepository } from './useUserRepository';

export type AccountInfo = UserAccountInfo;

export interface UseAccountInfoResult {
  accountInfo: AccountInfo | null;
  hasAccount: boolean;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  saveAccountInfo: (info: AccountInfo) => Promise<void>;
  deleteAccountInfo: () => Promise<void>;
}

export function useAccountInfo(): UseAccountInfoResult {
  const { user } = useAuth();
  const userRepository = useUserRepository();

  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [hasAccount, setHasAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setAccountInfo(null);
      setHasAccount(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = userRepository.subscribeToUserProfile(user.uid, {
      onData: profile => {
        const nextAccountInfo = resolveUserAccountInfo(profile);
        setAccountInfo(nextAccountInfo);
        setHasAccount(Boolean(nextAccountInfo));
        setLoading(false);
        setError(null);
      },
      onError: err => {
        console.error('계좌 정보 로드 실패:', err);
        setError('계좌 정보를 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [user?.uid, userRepository]);

  const saveCurrentAccountInfo = useCallback(
    async (info: AccountInfo) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      try {
        setSaving(true);
        setError(null);
        await saveUserAccountInfo({
          accountInfo: info,
          userId: user.uid,
          userRepository,
        });
        setHasAccount(true);
      } catch (err: any) {
        const message =
          err?.message && typeof err.message === 'string'
            ? err.message
            : '계좌 정보 저장에 실패했습니다.';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user?.uid, userRepository],
  );

  const removeCurrentAccountInfo = useCallback(async () => {
    if (!user?.uid) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setDeleting(true);
      setError(null);
      await deleteUserAccountInfo({
        userId: user.uid,
        userRepository,
      });
      setAccountInfo(null);
      setHasAccount(false);
    } catch (err: any) {
      const message =
        err?.message && typeof err.message === 'string'
          ? err.message
          : '계좌 정보 삭제에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [user?.uid, userRepository]);

  return {
    accountInfo,
    hasAccount,
    loading,
    saving,
    deleting,
    error,
    saveAccountInfo: saveCurrentAccountInfo,
    deleteAccountInfo: removeCurrentAccountInfo,
  };
}

