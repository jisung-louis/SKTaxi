// SKTaxi: 계좌 정보 관리 훅 (Repository 패턴 적용)

import { useState, useEffect, useCallback } from 'react';
import { useUserRepository } from '../../di/useRepository';
import { UserProfile } from '../../repositories/interfaces/IUserRepository';
import { useAuth } from '../auth';

export interface AccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  hideName: boolean;
}

export interface UseAccountInfoResult {
  /** 계좌 정보 */
  accountInfo: AccountInfo | null;
  /** 계좌 정보 존재 여부 */
  hasAccount: boolean;
  /** 로딩 상태 */
  loading: boolean;
  /** 저장 중 상태 */
  saving: boolean;
  /** 삭제 중 상태 */
  deleting: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 계좌 정보 저장 */
  saveAccountInfo: (info: AccountInfo) => Promise<void>;
  /** 계좌 정보 삭제 */
  deleteAccountInfo: () => Promise<void>;
}

/**
 * 현재 로그인된 사용자의 계좌 정보를 관리하는 훅
 */
export function useAccountInfo(): UseAccountInfoResult {
  const { user } = useAuth();
  const userRepository = useUserRepository();

  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [hasAccount, setHasAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 계좌 정보 로드 (실시간 구독)
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
      onData: (profile) => {
        if (profile?.accountInfo) {
          // UserProfile의 accountInfo 필드 사용
          setAccountInfo({
            bankName: profile.accountInfo.bankName || '',
            accountNumber: profile.accountInfo.accountNumber || '',
            accountHolder: profile.accountInfo.accountHolder || '',
            hideName: profile.accountInfo.hideName || false,
          });
          setHasAccount(true);
        } else if ((profile as any)?.account) {
          // 레거시 account 필드 호환
          const account = (profile as any).account;
          setAccountInfo({
            bankName: account.bankName || '',
            accountNumber: account.accountNumber || '',
            accountHolder: account.accountHolder || '',
            hideName: typeof account.hideName === 'boolean'
              ? account.hideName
              : account.nameVisibility === 'hidden',
          });
          setHasAccount(true);
        } else {
          setAccountInfo(null);
          setHasAccount(false);
        }
        setLoading(false);
        setError(null);
      },
      onError: (err) => {
        console.error('계좌 정보 로드 실패:', err);
        setError('계좌 정보를 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [user?.uid, userRepository]);

  // 계좌 정보 저장
  const saveAccountInfo = useCallback(async (info: AccountInfo) => {
    if (!user?.uid) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setSaving(true);
      setError(null);

      // 레거시 account 필드 형식으로 저장 (기존 코드 호환성)
      await userRepository.updateUserProfile(user.uid, {
        account: {
          bankName: info.bankName,
          accountNumber: info.accountNumber,
          accountHolder: info.accountHolder,
          hideName: info.hideName,
        },
      } as Partial<UserProfile>);

      setHasAccount(true);
    } catch (err: any) {
      const message = err?.message && typeof err.message === 'string'
        ? err.message
        : '계좌 정보 저장에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user?.uid, userRepository]);

  // 계좌 정보 삭제
  const deleteAccountInfo = useCallback(async () => {
    if (!user?.uid) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setDeleting(true);
      setError(null);

      await userRepository.deleteAccountInfo(user.uid);

      setAccountInfo(null);
      setHasAccount(false);
    } catch (err: any) {
      const message = err?.message && typeof err.message === 'string'
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
    saveAccountInfo,
    deleteAccountInfo,
  };
}
