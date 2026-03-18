import type {Notification} from '../data/repositories/INotificationRepository';
import type {NotificationInboxIconTone} from './notificationCenterSource';

export interface NotificationInboxItemViewData {
  contextLabel?: string;
  iconName: string;
  iconTone: NotificationInboxIconTone;
  id: string;
  isRead: boolean;
  message: string;
  notification: Notification;
  timeLabel: string;
  title: string;
}

export interface NotificationInboxSectionViewData {
  id: string;
  items: NotificationInboxItemViewData[];
  title: string;
}

export interface NotificationInboxViewData {
  emptyDescription: string;
  emptyTitle: string;
  sections: NotificationInboxSectionViewData[];
  unreadCount: number;
}
