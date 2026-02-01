// SKTaxi: 사용자 프로필 관리 훅 (Repository 패턴 적용)

import { useState, useEffect, useCallback } from 'react';
import { useUserRepository } from '../../di/useRepository';
import { UserProfile } from '../../repositories/interfaces/IUserRepository';
import { useAuth } from '../auth';

export interface UseUserProfileResult {
  /** 사용자 프로필 데이터 */
  profile: UserProfile | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 저장 중 상태 */
  saving: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 프로필 업데이트 함수 */
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  /** 새로고침 함수 */
  refresh: () => void;
}

/**
 * 현재 로그인된 사용자의 프로필을 관리하는 훅
 * 실시간 구독 지원
 */
export function useUserProfile(): UseUserProfileResult {
  const { user } = useAuth();
  const userRepository = useUserRepository();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 프로필 직접 로드 (새로고침용)
  const loadProfile = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      setError('로그인이 필요합니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const loadedProfile = await userRepository.getUserProfile(user.uid);
      setProfile(loadedProfile);
    } catch (err) {
      console.error('프로필 로드 실패:', err);
      setError('프로필을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, userRepository]);

  // 실시간 구독
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = userRepository.subscribeToUserProfile(user.uid, {
      onData: (updatedProfile) => {
        setProfile(updatedProfile);
        setLoading(false);
        setError(null);
      },
      onError: (err) => {
        console.error('프로필 실시간 구독 실패:', err);
        setError('프로필을 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [user?.uid, userRepository]);

  // 프로필 업데이트
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.uid) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setSaving(true);
      setError(null);
      await userRepository.updateUserProfile(user.uid, updates);
    } catch (err: any) {
      const message = err?.message && typeof err.message === 'string'
        ? err.message
        : '프로필 저장에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user?.uid, userRepository]);

  return {
    profile,
    loading,
    saving,
    error,
    updateProfile,
    refresh: loadProfile,
  };
}

/**
 * 특정 사용자의 프로필을 조회하는 훅 (읽기 전용)
 */
export function useUserProfileById(userId: string | undefined): {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
} {
  const userRepository = useUserRepository();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('사용자 ID가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = userRepository.subscribeToUserProfile(userId, {
      onData: (updatedProfile) => {
        setProfile(updatedProfile);
        setLoading(false);
        if (!updatedProfile) {
          setError('사용자를 찾을 수 없습니다.');
        } else {
          setError(null);
        }
      },
      onError: (err) => {
        console.error('사용자 프로필 조회 실패:', err);
        setError('사용자 정보를 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [userId, userRepository]);

  return { profile, loading, error };
}
