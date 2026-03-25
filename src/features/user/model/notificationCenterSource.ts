import type {Notification} from '../data/repositories/INotificationRepository';

export type NotificationInboxIconTone =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'yellow';

export interface NotificationInboxSourceItem {
  contextLabel?: string;
  iconName: string;
  iconTone: NotificationInboxIconTone;
  notification: Notification;
  timeLabel: string;
}
