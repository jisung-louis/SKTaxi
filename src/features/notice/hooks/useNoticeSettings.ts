import {useCallback, useEffect, useMemo, useState} from 'react';

import {useAuth} from '@/features/auth';
import {useMemberRepository} from '@/di';
import {
  buildToggleNotificationSettingPatch,
  resolveMemberNotificationSettings,
} from '@/features/user/services/notificationSettingsService';
import type {MemberNotificationSetting} from '@/features/member';

export interface NoticeSettingsDetail {
  [category: string]: boolean;
}

export interface NoticeSettingsState {
  noticeNotifications: boolean;
  noticeNotificationsDetail: NoticeSettingsDetail;
}

const DEFAULT_SETTINGS: NoticeSettingsState = {
  noticeNotifications: true,
  noticeNotificationsDetail: {},
};

export function useNoticeSettings() {
  const {user} = useAuth();
  const memberRepository = useMemberRepository();

  const [memberSettings, setMemberSettings] =
    useState<MemberNotificationSetting>(resolveMemberNotificationSettings());
  const [settings, setSettings] =
    useState<NoticeSettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setMemberSettings(resolveMemberNotificationSettings());
      setSettings(DEFAULT_SETTINGS);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let cancelled = false;

    const loadNoticeSettings = async () => {
      try {
        const memberProfile = await memberRepository.getMyMemberProfile();
        if (cancelled) {
          return;
        }

        const nextMemberSettings = resolveMemberNotificationSettings(
          memberProfile.notificationSetting,
        );
        setMemberSettings(nextMemberSettings);
        setSettings({
          noticeNotifications: nextMemberSettings.noticeNotifications,
          noticeNotificationsDetail:
            nextMemberSettings.noticeNotificationsDetail as NoticeSettingsDetail,
        });
        setLoading(false);
      } catch (err: any) {
        if (cancelled) {
          return;
        }

        setError(err?.message || '알림 설정을 불러오지 못했습니다.');
        setLoading(false);
      }
    };

    loadNoticeSettings().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [memberRepository, user?.uid]);

  const updateMaster = useCallback(
    async (enabled: boolean) => {
      if (!user?.uid) {
        return;
      }

      try {
        setError(null);
        const memberProfile =
          await memberRepository.updateMyNotificationSettings(
            buildToggleNotificationSettingPatch({
              currentSettings: memberSettings,
              enabled,
              key: 'noticeNotifications',
            }),
          );
        const nextMemberSettings = resolveMemberNotificationSettings(
          memberProfile.notificationSetting,
        );
        setMemberSettings(nextMemberSettings);
        setSettings({
          noticeNotifications: nextMemberSettings.noticeNotifications,
          noticeNotificationsDetail:
            nextMemberSettings.noticeNotificationsDetail as NoticeSettingsDetail,
        });
      } catch (e) {
        setError('설정 저장에 실패했습니다.');
        throw e;
      }
    },
    [memberRepository, memberSettings, user?.uid],
  );

  const updateDetail = useCallback(
    async (categoryKey: string, enabled: boolean) => {
      if (!user?.uid) {
        return;
      }

      try {
        setError(null);
        const currentDetail = {
          ...memberSettings.noticeNotificationsDetail,
          [categoryKey]: enabled,
        };
        const memberProfile =
          await memberRepository.updateMyNotificationSettings({
            noticeNotificationsDetail: currentDetail,
          });
        const nextMemberSettings = resolveMemberNotificationSettings(
          memberProfile.notificationSetting,
        );
        setMemberSettings(nextMemberSettings);
        setSettings({
          noticeNotifications: nextMemberSettings.noticeNotifications,
          noticeNotificationsDetail:
            nextMemberSettings.noticeNotificationsDetail as NoticeSettingsDetail,
        });
      } catch (e) {
        setError('설정 저장에 실패했습니다.');
        throw e;
      }
    },
    [memberRepository, memberSettings, user?.uid],
  );

  return useMemo(
    () => ({settings, loading, error, updateMaster, updateDetail}),
    [settings, loading, error, updateMaster, updateDetail],
  );
}
