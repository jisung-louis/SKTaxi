import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/auth';

import { UserNotificationSettings } from '../model/types';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  resolveNotificationSettings,
  updateUserNotificationSettings,
} from '../services/userProfileService';
import { useUserRepository } from './useUserRepository';

export type NotificationSettings = UserNotificationSettings;

export interface UseNotificationSettingsResult {
  settings: NotificationSettings;
  loading: boolean;
  error: string | null;
  updateSetting: (
    key: keyof Omit<NotificationSettings, 'noticeNotificationsDetail'>,
    value: boolean,
  ) => Promise<void>;
}

export function useNotificationSettings(): UseNotificationSettingsResult {
  const { user } = useAuth();
  const userRepository = useUserRepository();

  const [settings, setSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setSettings(DEFAULT_NOTIFICATION_SETTINGS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = userRepository.subscribeToUserProfile(user.uid, {
      onData: profile => {
        setSettings(resolveNotificationSettings(profile));
        setLoading(false);
      },
      onError: err => {
        console.error('알림 설정 로드 실패:', err);
        setError('알림 설정을 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [user?.uid, userRepository]);

  const updateSetting = useCallback(
    async (
      key: keyof Omit<NotificationSettings, 'noticeNotificationsDetail'>,
      value: boolean,
    ) => {
      if (!user?.uid) {
        return;
      }

      const previousSettings = settings;

      try {
        setError(null);

        const nextSettings = await updateUserNotificationSettings({
          currentSettings: settings,
          patch: { [key]: value },
          userId: user.uid,
          userRepository,
        });

        setSettings(nextSettings);
      } catch (err: any) {
        console.error('알림 설정 저장 실패:', err);
        setSettings(previousSettings);
        setError(
          err?.message && typeof err.message === 'string'
            ? err.message
            : '알림 설정 저장에 실패했습니다.',
        );
        throw err;
      }
    },
    [settings, user?.uid, userRepository],
  );

  return {
    settings,
    loading,
    error,
    updateSetting,
  };
}
