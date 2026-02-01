// SKTaxi: 알림 설정 관리 훅 (Repository 패턴 적용)

import { useState, useEffect, useCallback } from 'react';
import { useUserRepository } from '../../di/useRepository';
import { useAuth } from '../auth';

export interface NotificationSettings {
  allNotifications: boolean;
  partyNotifications: boolean;
  noticeNotifications: boolean;
  boardLikeNotifications: boolean;
  boardCommentNotifications: boolean;
  systemNotifications: boolean;
  marketingNotifications: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  allNotifications: true,
  partyNotifications: true,
  noticeNotifications: true,
  boardLikeNotifications: true,
  boardCommentNotifications: true,
  systemNotifications: true,
  marketingNotifications: false,
};

export interface UseNotificationSettingsResult {
  /** 알림 설정 */
  settings: NotificationSettings;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 설정 업데이트 함수 */
  updateSetting: (key: keyof NotificationSettings, value: boolean) => Promise<void>;
}

/**
 * 알림 설정을 관리하는 훅
 */
export function useNotificationSettings(): UseNotificationSettingsResult {
  const { user } = useAuth();
  const userRepository = useUserRepository();

  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 알림 설정 로드 (실시간 구독)
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = userRepository.subscribeToUserProfile(user.uid, {
      onData: (profile) => {
        if (profile && (profile as any).notificationSettings) {
          setSettings(prev => ({
            ...prev,
            ...(profile as any).notificationSettings,
          }));
        }
        setLoading(false);
      },
      onError: (err) => {
        console.error('알림 설정 로드 실패:', err);
        setError('알림 설정을 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [user?.uid, userRepository]);

  // 설정 업데이트
  const updateSetting = useCallback(async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    if (!user?.uid) return;

    const newSettings = { ...settings, [key]: value };

    // allNotifications가 false가 되면 모든 알림을 끔
    if (key === 'allNotifications' && !value) {
      newSettings.partyNotifications = false;
      newSettings.noticeNotifications = false;
      newSettings.boardLikeNotifications = false;
      newSettings.boardCommentNotifications = false;
      newSettings.systemNotifications = false;
      newSettings.marketingNotifications = false;
    }

    // allNotifications가 true가 되면 모든 알림을 켬
    if (key === 'allNotifications' && value) {
      newSettings.partyNotifications = true;
      newSettings.noticeNotifications = true;
      newSettings.boardLikeNotifications = true;
      newSettings.boardCommentNotifications = true;
      newSettings.systemNotifications = true;
      newSettings.marketingNotifications = true;
    }

    // 낙관적 업데이트
    const previousSettings = settings;
    setSettings(newSettings);

    try {
      await userRepository.updateUserProfile(user.uid, {
        notificationSettings: newSettings,
      } as any);
    } catch (err) {
      console.error('알림 설정 저장 실패:', err);
      // 실패 시 롤백
      setSettings(previousSettings);
      throw err;
    }
  }, [user?.uid, userRepository, settings]);

  return {
    settings,
    loading,
    error,
    updateSetting,
  };
}
