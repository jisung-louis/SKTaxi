// SKTaxi: 채팅방 알림 설정 구독 훅 (Repository 패턴)
// ChatListScreen에서 알림 아이콘 표시에 사용

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChatRepository } from '../../di/useRepository';
import { useAuth } from '../auth';

export interface UseChatRoomNotificationsResult {
  /** 채팅방별 알림 설정 맵 (chatRoomId -> enabled) */
  notifications: Record<string, boolean>;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 특정 채팅방의 알림이 활성화되어 있는지 확인 (기본값: true) */
  isNotificationEnabled: (chatRoomId: string) => boolean;
  /** 알림 설정 변경 */
  updateNotificationSetting: (chatRoomId: string, enabled: boolean) => Promise<void>;
}

/**
 * 채팅방 알림 설정 구독 훅
 */
export function useChatRoomNotifications(): UseChatRoomNotificationsResult {
  const { user } = useAuth();
  const chatRepository = useChatRepository();

  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    unsubscribeRef.current = chatRepository.subscribeToChatRoomNotifications(
      user.uid,
      {
        onData: (newNotifications) => {
          setNotifications(newNotifications);
          setLoading(false);
        },
        onError: (err) => {
          console.error('채팅방 알림 설정 구독 에러:', err);
          setError(err.message || '알림 설정을 불러오지 못했습니다.');
          setLoading(false);
        },
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.uid, chatRepository]);

  const isNotificationEnabled = useCallback(
    (chatRoomId: string): boolean => {
      // 명시적으로 설정되지 않은 경우 기본값은 true
      return notifications[chatRoomId] !== false;
    },
    [notifications]
  );

  const updateNotificationSetting = useCallback(
    async (chatRoomId: string, enabled: boolean) => {
      if (!user?.uid) {return;}
      try {
        await chatRepository.updateNotificationSetting(chatRoomId, user.uid, enabled);
      } catch (err: any) {
        console.error('알림 설정 변경 실패:', err);
        throw err;
      }
    },
    [user?.uid, chatRepository]
  );

  return {
    notifications,
    loading,
    error,
    isNotificationEnabled,
    updateNotificationSetting,
  };
}
