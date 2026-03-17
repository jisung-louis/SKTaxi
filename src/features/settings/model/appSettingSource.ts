export type AppSettingActionKey =
  | 'darkMode'
  | 'termsOfUse'
  | 'privacyPolicy'
  | 'appName'
  | 'appVersion';

export type AppSettingIconKey =
  | 'darkMode'
  | 'termsOfUse'
  | 'privacyPolicy'
  | 'appName'
  | 'appVersion';

export type AppSettingItemType = 'toggle' | 'link' | 'value';

export interface AppSettingItemSource {
  actionKey: AppSettingActionKey;
  disabled?: boolean;
  iconKey: AppSettingIconKey;
  id: string;
  subtitle?: string;
  title: string;
  type: AppSettingItemType;
  value?: string;
}

export interface AppSettingSectionSource {
  id: string;
  items: AppSettingItemSource[];
  title: string;
}

export interface AppSettingScreenSource {
  sections: AppSettingSectionSource[];
}
