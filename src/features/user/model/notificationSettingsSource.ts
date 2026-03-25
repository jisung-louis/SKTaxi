export type NotificationSettingKey =
  | 'partyNotifications'
  | 'noticeNotifications'
  | 'boardLikeNotifications'
  | 'commentNotifications'
  | 'bookmarkedPostCommentNotifications'
  | 'systemNotifications';

export interface NotificationSettingItemSource {
  enabled: boolean;
  key: NotificationSettingKey;
}

export interface NotificationSettingsScreenSource {
  allNotifications: boolean;
  items: NotificationSettingItemSource[];
}
