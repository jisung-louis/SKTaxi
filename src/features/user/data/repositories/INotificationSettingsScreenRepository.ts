import type {
  NotificationSettingKey,
  NotificationSettingsScreenSource,
} from '../../model/notificationSettingsSource';

export interface INotificationSettingsScreenRepository {
  getNotificationSettings(): Promise<NotificationSettingsScreenSource>;
  updateAllNotifications(
    enabled: boolean,
  ): Promise<NotificationSettingsScreenSource>;
  updateNotificationSetting(
    key: NotificationSettingKey,
    enabled: boolean,
  ): Promise<NotificationSettingsScreenSource>;
}
