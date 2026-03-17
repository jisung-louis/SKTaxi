import type {NotificationSettingKey} from './notificationSettingsSource';

export interface NotificationSettingMasterViewData {
  disabled: boolean;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  key: 'allNotifications';
  subtitle: string;
  title: string;
  value: boolean;
}

export interface NotificationSettingItemViewData {
  disabled: boolean;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  key: NotificationSettingKey;
  subtitle: string;
  title: string;
  value: boolean;
}

export interface NotificationSettingsScreenViewData {
  helperText: string;
  items: NotificationSettingItemViewData[];
  master: NotificationSettingMasterViewData;
}
