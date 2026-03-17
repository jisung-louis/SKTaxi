import type {UserNotificationSettings} from './types';

export type NotificationSettingKey =
  keyof Pick<
    UserNotificationSettings,
    | 'partyNotifications'
    | 'noticeNotifications'
    | 'boardLikeNotifications'
    | 'boardCommentNotifications'
    | 'systemNotifications'
    | 'marketingNotifications'
  >;

export type NotificationSettingIconKey =
  | 'allNotifications'
  | 'partyNotifications'
  | 'noticeNotifications'
  | 'boardLikeNotifications'
  | 'boardCommentNotifications'
  | 'systemNotifications'
  | 'marketingNotifications';

export interface NotificationSettingItemSource {
  enabled: boolean;
  iconKey: NotificationSettingIconKey;
  key: NotificationSettingKey;
  subtitle: string;
  title: string;
}

export interface NotificationSettingsScreenSource {
  allNotifications: boolean;
  helperText: string;
  items: NotificationSettingItemSource[];
}
