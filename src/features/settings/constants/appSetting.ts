import type {AppSettingActionKey} from '../model/appSettingViewData';

export type AppSettingIconKey =
  | 'darkMode'
  | 'termsOfUse'
  | 'privacyPolicy'
  | 'appName'
  | 'appVersion';

export type AppSettingItemType = 'toggle' | 'link' | 'value';

export interface AppSettingItemConfig {
  actionKey: AppSettingActionKey;
  disabled?: boolean;
  iconKey: AppSettingIconKey;
  id: string;
  subtitle?: string;
  title: string;
  type: AppSettingItemType;
  value?: string;
}

export interface AppSettingSectionConfig {
  id: string;
  items: AppSettingItemConfig[];
  title: string;
}

const APP_SETTING_SECTIONS_BASE: AppSettingSectionConfig[] = [
  {
    id: 'display',
    title: '화면',
    items: [
      {
        actionKey: 'darkMode',
        disabled: true,
        iconKey: 'darkMode',
        id: 'dark-mode',
        subtitle: '추후 지원 예정',
        title: '다크 모드',
        type: 'toggle',
      },
    ],
  },
  {
    id: 'legal',
    title: '법적 정보',
    items: [
      {
        actionKey: 'termsOfUse',
        iconKey: 'termsOfUse',
        id: 'terms-of-use',
        title: '이용약관',
        type: 'link',
      },
      {
        actionKey: 'privacyPolicy',
        iconKey: 'privacyPolicy',
        id: 'privacy-policy',
        title: '개인정보 처리방침',
        type: 'link',
      },
    ],
  },
  {
    id: 'app-info',
    title: '앱 정보',
    items: [
      {
        actionKey: 'appName',
        iconKey: 'appName',
        id: 'app-name',
        title: '앱 이름',
        type: 'value',
        value: '스쿠리 - SKURI',
      },
      {
        actionKey: 'appVersion',
        iconKey: 'appVersion',
        id: 'app-version',
        title: '버전',
        type: 'value',
      },
    ],
  },
];

export const buildAppSettingSections = (
  appVersion: string,
): AppSettingSectionConfig[] => {
  return APP_SETTING_SECTIONS_BASE.map(section => ({
    ...section,
    items: section.items.map(item =>
      item.actionKey === 'appVersion'
        ? {...item, value: `v${appVersion}`}
        : {...item},
    ),
  }));
};
