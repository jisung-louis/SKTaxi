import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/auth';

import { UserProfile } from '../model/types';
import { saveUserProfileChanges } from '../services/userProfileService';
import { useUserRepository } from './useUserRepository';

export interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refresh: () => void;
  checkDisplayNameAvailable: (displayName: string) => Promise<void>;
  saveProfileChanges: (params: {
    displayName: string;
    studentId: string;
    department: string;
    previousDepartment?: string;
  }) => Promise<void>;
}

export function useUserProfile(): UseUserProfileResult {
  const { user } = useAuth();
  const userRepository = useUserRepository();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = userRepository.subscribeToUserProfile(user.uid, {
      onData: updatedProfile => {
        setProfile(updatedProfile);
        setLoading(false);
        setError(null);
      },
      onError: err => {
        console.error('프로필 실시간 구독 실패:', err);
        setError('프로필을 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [user?.uid, userRepository]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      try {
        setSaving(true);
        setError(null);
        await userRepository.updateUserProfile(user.uid, updates);
      } catch (err: any) {
        const message =
          err?.message && typeof err.message === 'string'
            ? err.message
            : '프로필 저장에 실패했습니다.';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user?.uid, userRepository],
  );

  const checkDisplayNameAvailable = useCallback(
    async (displayName: string) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      try {
        setError(null);
        await userRepository.checkDisplayNameAvailable(displayName, user.uid);
      } catch (err: any) {
        const message =
          err?.message && typeof err.message === 'string'
            ? err.message
            : '닉네임 확인에 실패했습니다.';
        setError(message);
        throw err;
      }
    },
    [user?.uid, userRepository],
  );

  const saveProfileChangesForUser = useCallback(
    async ({
      department,
      displayName,
      previousDepartment,
      studentId,
    }: {
      displayName: string;
      studentId: string;
      department: string;
      previousDepartment?: string;
    }) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      try {
        setSaving(true);
        setError(null);
        await saveUserProfileChanges({
          department,
          displayName,
          previousDepartment,
          studentId,
          userId: user.uid,
          userRepository,
        });
      } catch (err: any) {
        const message =
          err?.message && typeof err.message === 'string'
            ? err.message
            : '프로필 저장에 실패했습니다.';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user?.uid, userRepository],
  );

  return {
    profile,
    loading,
    saving,
    error,
    updateProfile,
    refresh: loadProfile,
    checkDisplayNameAvailable,
    saveProfileChanges: saveProfileChangesForUser,
  };
}

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
      onData: updatedProfile => {
        setProfile(updatedProfile);
        setLoading(false);

        if (!updatedProfile) {
          setError('사용자를 찾을 수 없습니다.');
        } else {
          setError(null);
        }
      },
      onError: err => {
        console.error('사용자 프로필 조회 실패:', err);
        setError('사용자 정보를 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [userId, userRepository]);

  return { profile, loading, error };
}

