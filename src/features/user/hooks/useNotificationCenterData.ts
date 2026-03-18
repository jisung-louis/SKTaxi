import React from 'react';

import type {INotificationCenterRepository} from '../data/repositories/INotificationCenterRepository';
import {MockNotificationCenterRepository} from '../data/repositories/MockNotificationCenterRepository';
import type {
  NotificationInboxItemViewData,
  NotificationInboxSectionViewData,
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

const buildViewData = (
  items: NotificationInboxItemViewData[],
): NotificationInboxViewData => {
  const unreadItems = items.filter(item => !item.isRead);
  const readItems = items.filter(item => item.isRead);
  const sections: NotificationInboxSectionViewData[] = [];

  if (unreadItems.length > 0) {
    sections.push({
      id: 'unread',
      items: unreadItems,
    });
  }

  if (readItems.length > 0) {
    sections.push({
      id: 'read',
      items: readItems,
    });
  }

  return {
    sections,
    unreadCount: unreadItems.length,
  };
};

export const useNotificationCenterData =
  (): UseNotificationCenterDataResult => {
    const repositoryRef =
      React.useRef<INotificationCenterRepository | null>(null);

    if (!repositoryRef.current) {
      repositoryRef.current = new MockNotificationCenterRepository();
    }

    const [items, setItems] = React.useState<NotificationInboxItemViewData[]>(
      [],
    );
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const load = React.useCallback(async () => {
      if (!repositoryRef.current) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextItems = await repositoryRef.current.getInboxItems();
        setItems(
          nextItems.map(item => ({
            contextLabel: item.contextLabel,
            iconName: item.iconName,
            iconTone: item.iconTone,
            id: item.notification.id,
            isRead: item.notification.isRead,
            message: item.notification.message,
            notification: item.notification,
            timeLabel: item.timeLabel,
            title: item.notification.title,
          })),
        );
      } catch (loadError) {
        console.error('notification center mock load failed', loadError);
        setError('알림함을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }, []);

    React.useEffect(() => {
      load();
    }, [load]);

    const markAsRead = React.useCallback(
      async (notificationId: string) => {
        if (!repositoryRef.current) {
          return;
        }

        await repositoryRef.current.markAsRead(notificationId);
        await load();
      },
      [load],
    );

    const markAllAsRead = React.useCallback(async () => {
      if (!repositoryRef.current) {
        return;
      }

      const unreadIds = items
        .filter(item => !item.isRead)
        .map(item => item.id);

      if (unreadIds.length === 0) {
        return;
      }

      await repositoryRef.current.markAllAsRead(unreadIds);
      await load();
    }, [items, load]);

    const data = React.useMemo(() => {
      if (loading && items.length === 0 && !error) {
        return null;
      }

      return buildViewData(items);
    }, [error, items, loading]);

    return {
      data,
      error,
      loading,
      markAllAsRead,
      markAsRead,
      reload: load,
    };
  };
