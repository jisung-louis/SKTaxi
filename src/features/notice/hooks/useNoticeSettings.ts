import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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

const applyMasterOptimistically = (
  previous: NoticeSettingsState,
  enabled: boolean,
): NoticeSettingsState => ({
  ...previous,
  noticeNotifications: enabled,
});

const applyDetailOptimistically = (
  previous: NoticeSettingsState,
  categoryKey: string,
  enabled: boolean,
): NoticeSettingsState => ({
  ...previous,
  noticeNotificationsDetail: {
    ...previous.noticeNotificationsDetail,
    [categoryKey]: enabled,
  },
});

const mapNoticeSettingsState = (
  memberSettings: MemberNotificationSetting,
): NoticeSettingsState => ({
  noticeNotifications: memberSettings.noticeNotifications,
  noticeNotificationsDetail:
    memberSettings.noticeNotificationsDetail as NoticeSettingsDetail,
});

export function useNoticeSettings() {
  const {user} = useAuth();
  const memberRepository = useMemberRepository();

  const [memberSettings, setMemberSettings] =
    useState<MemberNotificationSetting>(resolveMemberNotificationSettings());
  const [settings, setSettings] =
    useState<NoticeSettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const settingsRef = useRef(DEFAULT_SETTINGS);
  const stableSettingsRef = useRef(DEFAULT_SETTINGS);
  const memberSettingsRef =
    useRef<MemberNotificationSetting>(resolveMemberNotificationSettings());
  const savingRef = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    memberSettingsRef.current = memberSettings;
  }, [memberSettings]);

  useEffect(() => {
    if (!user?.uid) {
      const nextMemberSettings = resolveMemberNotificationSettings();
      memberSettingsRef.current = nextMemberSettings;
      setMemberSettings(nextMemberSettings);
      stableSettingsRef.current = DEFAULT_SETTINGS;
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
        const nextSettings = mapNoticeSettingsState(nextMemberSettings);

        memberSettingsRef.current = nextMemberSettings;
        stableSettingsRef.current = nextSettings;
        setMemberSettings(nextMemberSettings);
        setSettings(nextSettings);
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
      if (!user?.uid || savingRef.current) {
        return;
      }

      const previousSettings = stableSettingsRef.current ?? settingsRef.current;
      const optimisticSettings = applyMasterOptimistically(
        previousSettings,
        enabled,
      );

      try {
        savingRef.current = true;
        setSaving(true);
        setError(null);
        setSettings(optimisticSettings);

        const memberProfile =
          await memberRepository.updateMyNotificationSettings(
            buildToggleNotificationSettingPatch({
              currentSettings: memberSettingsRef.current,
              enabled,
              key: 'noticeNotifications',
            }),
          );
        const nextMemberSettings = resolveMemberNotificationSettings(
          memberProfile.notificationSetting,
        );
        const nextSettings = mapNoticeSettingsState(nextMemberSettings);

        memberSettingsRef.current = nextMemberSettings;
        stableSettingsRef.current = nextSettings;
        setMemberSettings(nextMemberSettings);
        setSettings(nextSettings);
      } catch (e) {
        setError('설정 저장에 실패했습니다.');
        setSettings(previousSettings);
        throw e;
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    [memberRepository, user?.uid],
  );

  const updateDetail = useCallback(
    async (categoryKey: string, enabled: boolean) => {
      if (!user?.uid || savingRef.current) {
        return;
      }

      const previousSettings = stableSettingsRef.current ?? settingsRef.current;
      const optimisticSettings = applyDetailOptimistically(
        previousSettings,
        categoryKey,
        enabled,
      );

      try {
        savingRef.current = true;
        setSaving(true);
        setError(null);
        setSettings(optimisticSettings);

        const currentDetail = {
          ...memberSettingsRef.current.noticeNotificationsDetail,
          [categoryKey]: enabled,
        };
        const memberProfile =
          await memberRepository.updateMyNotificationSettings({
            noticeNotificationsDetail: currentDetail,
          });
        const nextMemberSettings = resolveMemberNotificationSettings(
          memberProfile.notificationSetting,
        );
        const nextSettings = mapNoticeSettingsState(nextMemberSettings);

        memberSettingsRef.current = nextMemberSettings;
        stableSettingsRef.current = nextSettings;
        setMemberSettings(nextMemberSettings);
        setSettings(nextSettings);
      } catch (e) {
        setError('설정 저장에 실패했습니다.');
        setSettings(previousSettings);
        throw e;
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    [memberRepository, user?.uid],
  );

  return useMemo(
    () => ({settings, loading, error, saving, updateMaster, updateDetail}),
    [settings, loading, error, saving, updateMaster, updateDetail],
  );
}
