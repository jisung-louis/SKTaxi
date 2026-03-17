import React from 'react';

import {V2_COLORS} from '@/shared/design-system/tokens';

import {appSettingRepository} from '../data/repositories/appSettingRepository';
import type {
  AppSettingIconKey,
  AppSettingScreenSource,
} from '../model/appSettingSource';
import type {
  AppSettingRowViewData,
  AppSettingScreenViewData,
} from '../model/appSettingViewData';

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
  item: AppSettingScreenSource['sections'][number]['items'][number],
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

const mapScreen = (source: AppSettingScreenSource): AppSettingScreenViewData => {
  return {
    sections: source.sections.map(section => ({
      id: section.id,
      items: section.items.map(mapRow),
      title: section.title,
    })),
  };
};

export const useAppSettingData = () => {
  const [data, setData] = React.useState<AppSettingScreenViewData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const source = await appSettingRepository.getAppSettings();
      setData(mapScreen(source));
    } catch (caughtError) {
      console.error('앱 설정 데이터를 불러오지 못했습니다.', caughtError);
      setError('앱 설정 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  return {
    data,
    error,
    loading,
    reload: load,
  };
};
