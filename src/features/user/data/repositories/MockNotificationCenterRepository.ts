import type {INotificationCenterRepository} from './INotificationCenterRepository';
import {NOTIFICATION_CENTER_MOCK} from '../../mocks/notificationCenter.mock';
import type {NotificationInboxSourceItem} from '../../model/notificationCenterSource';

let notificationState = NOTIFICATION_CENTER_MOCK.map(item => ({
  ...item,
  notification: {
    ...item.notification,
    createdAt: new Date(item.notification.createdAt),
    readAt: item.notification.readAt
      ? new Date(item.notification.readAt)
      : undefined,
  },
}));

const cloneItem = (
  item: NotificationInboxSourceItem,
): NotificationInboxSourceItem => ({
  ...item,
  notification: {
    ...item.notification,
    createdAt: new Date(item.notification.createdAt),
    readAt: item.notification.readAt ? new Date(item.notification.readAt) : undefined,
  },
});

export class MockNotificationCenterRepository
  implements INotificationCenterRepository
{
  async getInboxItems(): Promise<NotificationInboxSourceItem[]> {
    await new Promise(resolve => setTimeout(resolve, 120));
    return notificationState.map(cloneItem);
  }

  async markAllAsRead(notificationIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 80));

    notificationState = notificationState.map(item => {
      if (!notificationIds.includes(item.notification.id)) {
        return item;
      }

      return {
        ...item,
        notification: {
          ...item.notification,
          isRead: true,
          readAt: new Date(),
        },
      };
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 60));

    notificationState = notificationState.map(item => {
      if (item.notification.id !== notificationId) {
        return item;
      }

      return {
        ...item,
        notification: {
          ...item.notification,
          isRead: true,
          readAt: new Date(),
        },
      };
    });
  }
}
