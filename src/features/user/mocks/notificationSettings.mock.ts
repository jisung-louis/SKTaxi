import type {NotificationSettingsScreenSource} from '../model/notificationSettingsSource';

export const notificationSettingsMockData: NotificationSettingsScreenSource = {
  allNotifications: true,
  items: [
    {
      enabled: true,
      key: 'partyNotifications',
    },
    {
      enabled: true,
      key: 'noticeNotifications',
    },
    {
      enabled: true,
      key: 'boardLikeNotifications',
    },
    {
      enabled: true,
      key: 'boardCommentNotifications',
    },
    {
      enabled: true,
      key: 'systemNotifications',
    },
    {
      enabled: false,
      key: 'marketingNotifications',
    },
  ],
};
