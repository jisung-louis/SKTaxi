import React from 'react';

import {V2_COLORS} from '@/shared/design-system/tokens';

import {
  NOTIFICATION_SETTINGS_ITEM_META,
  NOTIFICATION_SETTINGS_MASTER_META,
  type NotificationSettingIconKey,
} from '../constants/notificationSettings';
import {notificationSettingsScreenRepository} from '../data/repositories/notificationSettingsScreenRepository';
import type {
  NotificationSettingKey,
  NotificationSettingsScreenSource,
} from '../model/notificationSettingsSource';
import type {
  NotificationSettingItemViewData,
  NotificationSettingMasterViewData,
  NotificationSettingsScreenViewData,
} from '../model/notificationSettingsViewData';

const resolveIcon = (iconKey: NotificationSettingIconKey) => {
  switch (iconKey) {
    case 'allNotifications':
      return {
        iconBackgroundColor: V2_COLORS.brand.primaryTint,
        iconColor: V2_COLORS.brand.primary,
        iconName: 'notifications-outline',
      };
    case 'partyNotifications':
      return {
        iconBackgroundColor: V2_COLORS.accent.orangeSoft,
        iconColor: V2_COLORS.accent.orange,
        iconName: 'car-outline',
      };
    case 'noticeNotifications':
      return {
        iconBackgroundColor: V2_COLORS.accent.blueSoft,
        iconColor: V2_COLORS.accent.blue,
        iconName: 'megaphone-outline',
      };
    case 'boardLikeNotifications':
      return {
        iconBackgroundColor: V2_COLORS.accent.pinkSoft,
        iconColor: V2_COLORS.status.danger,
        iconName: 'heart-outline',
      };
    case 'boardCommentNotifications':
      return {
        iconBackgroundColor: V2_COLORS.brand.primaryTint,
        iconColor: V2_COLORS.brand.primary,
        iconName: 'chatbubble-outline',
      };
    case 'systemNotifications':
      return {
        iconBackgroundColor: V2_COLORS.accent.purpleSoft,
        iconColor: V2_COLORS.accent.purple,
        iconName: 'shield-checkmark-outline',
      };
    case 'marketingNotifications':
    default:
      return {
        iconBackgroundColor: V2_COLORS.accent.pinkSoft,
        iconColor: V2_COLORS.accent.pink,
        iconName: 'gift-outline',
      };
  }
};

const mapItem = (
  item: NotificationSettingsScreenSource['items'][number],
  disabled: boolean,
): NotificationSettingItemViewData => {
  const meta = NOTIFICATION_SETTINGS_ITEM_META[item.key];
  const icon = resolveIcon(meta.iconKey);

  return {
    disabled,
    ...icon,
    key: item.key,
    subtitle: meta.subtitle,
    title: meta.title,
    value: item.enabled,
  };
};

const mapScreen = (
  source: NotificationSettingsScreenSource,
): NotificationSettingsScreenViewData => {
  const master: NotificationSettingMasterViewData = {
    disabled: false,
    ...resolveIcon(NOTIFICATION_SETTINGS_MASTER_META.iconKey),
    key: 'allNotifications',
    subtitle: NOTIFICATION_SETTINGS_MASTER_META.subtitle,
    title: NOTIFICATION_SETTINGS_MASTER_META.title,
    value: source.allNotifications,
  };

  return {
    items: source.items.map(item => mapItem(item, !source.allNotifications)),
    master,
  };
};

export const useNotificationSettingsScreenData = () => {
  const [data, setData] = React.useState<NotificationSettingsScreenViewData | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const source =
        await notificationSettingsScreenRepository.getNotificationSettings();
      setData(mapScreen(source));
    } catch (caughtError) {
      console.error('알림 설정 데이터를 불러오지 못했습니다.', caughtError);
      setError('알림 설정을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const toggleAll = React.useCallback(async (enabled: boolean) => {
    try {
      const source =
        await notificationSettingsScreenRepository.updateAllNotifications(enabled);
      setData(mapScreen(source));
    } catch (caughtError) {
      console.error('전체 알림 설정을 변경하지 못했습니다.', caughtError);
      setError('전체 알림 설정 변경에 실패했습니다.');
    }
  }, []);

  const toggleItem = React.useCallback(
    async (key: NotificationSettingKey, enabled: boolean) => {
      try {
        const source =
          await notificationSettingsScreenRepository.updateNotificationSetting(
            key,
            enabled,
          );
        setData(mapScreen(source));
      } catch (caughtError) {
        console.error('개별 알림 설정을 변경하지 못했습니다.', caughtError);
        setError('개별 알림 설정 변경에 실패했습니다.');
      }
    },
    [],
  );

  return {
    data,
    error,
    loading,
    reload: load,
    toggleAll,
    toggleItem,
  };
};
