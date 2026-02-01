// SKTaxi: 알림 관련 훅 (Repository 패턴 적용)

import { useState, useEffect, useCallback } from 'react';
import { useNotificationRepository } from '../../di/useRepository';
import { useAuth } from '../auth';
import { Notification } from '../../repositories/interfaces/INotificationRepository';

export interface UseNotificationsResult {
  /** 알림 목록 */
  notifications: Notification[];
  /** 로딩 상태 */
  loading: boolean;
  /** 초기화 완료 여부 */
  initialized: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 읽지 않은 알림 수 */
  unreadCount: number;
  /** 단일 알림 읽음 처리 */
  markAsRead: (notificationId: string) => Promise<void>;
  /** 모든 알림 읽음 처리 */
  markAllAsRead: () => Promise<void>;
  /** 단일 알림 삭제 */
  deleteNotification: (notificationId: string) => Promise<void>;
  /** 모든 알림 삭제 */
  deleteAllNotifications: () => Promise<void>;
}

/**
 * 알림을 관리하는 훅 (Repository 패턴)
 * 실시간 구독 및 읽음/삭제 기능 제공
 */
export function useNotifications(notificationLimit: number = 50): UseNotificationsResult {
  const { user } = useAuth();
  const notificationRepository = useNotificationRepository();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 알림 목록 실시간 구독
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setError(null);
      setLoading(false);
      setInitialized(false);
      return;
    }

    const unsubscribe = notificationRepository.subscribeToNotifications(
      user.uid,
      notificationLimit,
      {
        onData: (notificationList) => {
          setNotifications(notificationList);
          setLoading(false);
          setInitialized(true);
        },
        onError: (err) => {
          console.error('알림 로드 실패:', err);
          setError(err.message);
          setLoading(false);
          setInitialized(true);
        },
      }
    );

    return () => unsubscribe();
  }, [user?.uid, notificationLimit, notificationRepository]);

  // 단일 알림 읽음 처리
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.uid) return;

    try {
      await notificationRepository.markAsRead(user.uid, notificationId);
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  }, [user?.uid, notificationRepository]);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const unreadIds = notifications
        .filter((n) => !n.isRead)
        .map((n) => n.id);

      if (unreadIds.length > 0) {
        await notificationRepository.markAllAsRead(user.uid, unreadIds);
      }
    } catch (err) {
      console.error('모든 알림 읽음 처리 실패:', err);
    }
  }, [user?.uid, notifications, notificationRepository]);

  // 단일 알림 삭제
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.uid) return;

    try {
      await notificationRepository.deleteNotification(user.uid, notificationId);
    } catch (err) {
      console.error('알림 삭제 실패:', err);
      throw err;
    }
  }, [user?.uid, notificationRepository]);

  // 모든 알림 삭제
  const deleteAllNotifications = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await notificationRepository.deleteAllNotifications(user.uid);
    } catch (err) {
      console.error('모든 알림 삭제 실패:', err);
      throw err;
    }
  }, [user?.uid, notificationRepository]);

  return {
    notifications,
    loading,
    initialized,
    error,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
}
