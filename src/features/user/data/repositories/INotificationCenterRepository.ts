import type {NotificationInboxSourceItem} from '../../model/notificationCenterSource';

export interface INotificationCenterRepository {
  getInboxItems(): Promise<NotificationInboxSourceItem[]>;
  markAllAsRead(notificationIds: string[]): Promise<void>;
  markAsRead(notificationId: string): Promise<void>;
}
