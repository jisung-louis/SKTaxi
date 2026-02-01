// SKTaxi: 공지사항 알림 설정 훅 - Repository 패턴 적용

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRepository } from '../../di';
import { useAuth } from '../auth';

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
  const { user } = useAuth();
  const { userRepository } = useRepository();
  
  const [settings, setSettings] = useState<NoticeSettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = userRepository.subscribeToUserProfile(user.uid, {
      onData: (profile) => {
        const ns = (profile as any)?.notificationSettings || {};
        const next: NoticeSettingsState = {
          noticeNotifications: ns.noticeNotifications !== false,
          noticeNotificationsDetail: (ns.noticeNotificationsDetail || {}) as NoticeSettingsDetail,
        };
        setSettings(next);
        setLoading(false);
      },
      onError: (err) => {
        setError(err?.message || '알림 설정을 불러오지 못했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [user?.uid, userRepository]);

  const updateMaster = useCallback(async (enabled: boolean) => {
    if (!user?.uid) return;
    
    try {
      await userRepository.updateUserProfile(user.uid, {
        notificationSettings: { noticeNotifications: enabled },
      } as any);
    } catch (e) {
      setError('설정 저장에 실패했습니다.');
      throw e;
    }
  }, [user?.uid, userRepository]);

  const updateDetail = useCallback(async (categoryKey: string, enabled: boolean) => {
    if (!user?.uid) return;
    
    try {
      const currentDetail = { ...settings.noticeNotificationsDetail, [categoryKey]: enabled };
      await userRepository.updateUserProfile(user.uid, {
        notificationSettings: { noticeNotificationsDetail: currentDetail },
      } as any);
    } catch (e) {
      setError('설정 저장에 실패했습니다.');
      throw e;
    }
  }, [user?.uid, userRepository, settings.noticeNotificationsDetail]);

  const value = useMemo(
    () => ({ settings, loading, error, updateMaster, updateDetail }),
    [settings, loading, error, updateMaster, updateDetail]
  );
  
  return value;
}
