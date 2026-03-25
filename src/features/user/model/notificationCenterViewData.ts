import type {Notification} from '../data/repositories/INotificationRepository';

export type NotificationInboxIconTone =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'yellow';

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
  id: 'read' | 'unread';
  items: NotificationInboxItemViewData[];
}

export interface NotificationInboxViewData {
  sections: NotificationInboxSectionViewData[];
  unreadCount: number;
}
