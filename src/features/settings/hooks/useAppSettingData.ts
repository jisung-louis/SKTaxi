import React from 'react';

import {V2_COLORS} from '@/shared/design-system/tokens';

import {
  buildAppSettingSections,
  type AppSettingIconKey,
  type AppSettingSectionConfig,
} from '../constants/appSetting';
import type {
  AppSettingRowViewData,
  AppSettingScreenViewData,
} from '../model/appSettingViewData';
import {getCurrentAppVersion} from '../services/appVersionService';

const resolveRowIcon = (iconKey: AppSettingIconKey) => {
  switch (iconKey) {
    case 'darkMode':
      return {
        iconBackgroundColor: V2_COLORS.background.subtle,
        iconColor: V2_COLORS.text.secondary,
        iconName: 'moon-outline',
      };
    case 'termsOfUse':
      return {
        iconBackgroundColor: V2_COLORS.accent.blueSoft,
        iconColor: V2_COLORS.accent.blue,
        iconName: 'document-text-outline',
      };
    case 'privacyPolicy':
      return {
        iconBackgroundColor: V2_COLORS.brand.primaryTint,
        iconColor: V2_COLORS.brand.primary,
        iconName: 'shield-checkmark-outline',
      };
    case 'appName':
      return {
        iconBackgroundColor: V2_COLORS.brand.primaryTint,
        iconColor: V2_COLORS.brand.primary,
        iconName: 'phone-portrait-outline',
      };
    case 'appVersion':
    default:
      return {
        iconBackgroundColor: V2_COLORS.background.subtle,
        iconColor: V2_COLORS.text.secondary,
        iconName: 'code-slash-outline',
      };
  }
};

const mapRow = (
  item: AppSettingSectionConfig['items'][number],
): AppSettingRowViewData => {
  const icon = resolveRowIcon(item.iconKey);

  return {
    accessoryType:
      item.type === 'toggle'
        ? 'toggle'
        : item.type === 'link'
          ? 'chevron'
          : 'value',
    actionKey: item.actionKey,
    disabled: Boolean(item.disabled),
    ...icon,
    id: item.id,
    subtitle: item.subtitle,
    title: item.title,
    toggleValue: false,
    valueLabel: item.value,
  };
};

const mapScreen = (
  sections: AppSettingSectionConfig[],
): AppSettingScreenViewData => {
  return {
    sections: sections.map(section => ({
      id: section.id,
      items: section.items.map(mapRow),
      title: section.title,
    })),
  };
};

export const useAppSettingData = () => {
  const data = React.useMemo<AppSettingScreenViewData>(() => {
    return mapScreen(buildAppSettingSections(getCurrentAppVersion()));
  }, []);

  return {data};
};
