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

export interface NotificationSettingItemSource {
  enabled: boolean;
  key: NotificationSettingKey;
}

export interface NotificationSettingsScreenSource {
  allNotifications: boolean;
  items: NotificationSettingItemSource[];
}
