import React from 'react';

import {useNotificationRepository} from '@/di/useRepository';
import {useAuth} from '@/features/auth';

import {
  buildNotificationCenterViewData,
  mapNotificationToInboxItemViewData,
} from '../application/notificationCenterAssembler';
import type {
  NotificationInboxViewData,
} from '../model/notificationCenterViewData';

interface UseNotificationCenterDataResult {
  data: NotificationInboxViewData | null;
  error: string | null;
  loading: boolean;
  markAllAsRead: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  reload: () => Promise<void>;
}

const NOTIFICATION_CENTER_LIMIT = 100;

export const useNotificationCenterData =
  (): UseNotificationCenterDataResult => {
    const notificationRepository = useNotificationRepository();
    const {user} = useAuth();
    const [data, setData] = React.useState<NotificationInboxViewData | null>(
      null,
    );
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const load = React.useCallback(async () => {
      if (!user?.uid) {
        setData({
          sections: [],
          unreadCount: 0,
        });
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const notifications = await notificationRepository.getNotifications(
          user.uid,
          NOTIFICATION_CENTER_LIMIT,
        );
        const items = notifications.map(mapNotificationToInboxItemViewData);
        setData(buildNotificationCenterViewData(items));
      } catch (loadError) {
        console.error('알림함 데이터를 불러오지 못했습니다.', loadError);
        setError('알림함을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }, [notificationRepository, user?.uid]);

    React.useEffect(() => {
      load().catch(() => undefined);
    }, [load]);

    const markAsRead = React.useCallback(
      async (notificationId: string) => {
        if (!user?.uid) {
          return;
        }

        await notificationRepository.markAsRead(user.uid, notificationId);
        await load();
      },
      [load, notificationRepository, user?.uid],
    );

    const markAllAsRead = React.useCallback(async () => {
      if (!user?.uid) {
        return;
      }

      const unreadIds =
        data?.sections
          .find(section => section.id === 'unread')
          ?.items.map(item => item.id) ?? [];

      if (unreadIds.length === 0) {
        return;
      }

      await notificationRepository.markAllAsRead(user.uid, unreadIds);
      await load();
    }, [data?.sections, load, notificationRepository, user?.uid]);

    return {
      data,
      error,
      loading,
      markAllAsRead,
      markAsRead,
      reload: load,
    };
  };
