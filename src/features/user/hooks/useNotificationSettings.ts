import {useCallback, useEffect, useState} from 'react';

import {useAuth} from '@/features/auth';
import type {MemberNotificationSetting} from '@/features/member';
import {useMemberRepository} from '@/di';

import type {NotificationSettingKey} from '../model/notificationSettingsSource';
import {
  buildToggleAllNotificationsPatch,
  buildToggleNotificationSettingPatch,
  resolveMemberNotificationSettings,
} from '../services/notificationSettingsService';

export type NotificationSettings = Pick<
  MemberNotificationSetting,
  'allNotifications' | NotificationSettingKey | 'noticeNotificationsDetail'
>;

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
  const {user} = useAuth();
  const memberRepository = useMemberRepository();

  const [settings, setSettings] = useState<NotificationSettings>(
    resolveMemberNotificationSettings(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setSettings(resolveMemberNotificationSettings());
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let cancelled = false;

    const loadNotificationSettings = async () => {
      try {
        const memberProfile = await memberRepository.getMyMemberProfile();
        if (cancelled) {
          return;
        }

        setSettings(
          resolveMemberNotificationSettings(memberProfile.notificationSetting),
        );
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error('알림 설정 로드 실패:', err);
        setError('알림 설정을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    loadNotificationSettings().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [memberRepository, user?.uid]);

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

        const memberProfile =
          await memberRepository.updateMyNotificationSettings(
            key === 'allNotifications'
              ? buildToggleAllNotificationsPatch(value)
              : buildToggleNotificationSettingPatch({
                  currentSettings: resolveMemberNotificationSettings(settings),
                  enabled: value,
                  key,
                }),
          );
        const nextSettings = resolveMemberNotificationSettings(
          memberProfile.notificationSetting,
        );

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
    [memberRepository, settings, user?.uid],
  );

  return {
    settings,
    loading,
    error,
    updateSetting,
  };
}
