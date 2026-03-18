import React from 'react';

import {COLORS} from '@/shared/design-system/tokens';

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

type NotificationSettingIconKey =
  | 'allNotifications'
  | 'partyNotifications'
  | 'noticeNotifications'
  | 'boardLikeNotifications'
  | 'boardCommentNotifications'
  | 'systemNotifications'
  | 'marketingNotifications';

interface NotificationSettingMeta {
  iconKey: NotificationSettingIconKey;
  subtitle: string;
  title: string;
}

const NOTIFICATION_SETTINGS_MASTER_META: NotificationSettingMeta = {
  iconKey: 'allNotifications',
  subtitle: '모든 알림을 한 번에 켜거나 끕니다',
  title: '모든 알림',
};

const NOTIFICATION_SETTINGS_ITEM_META: Record<
  NotificationSettingKey,
  NotificationSettingMeta
> = {
  partyNotifications: {
    iconKey: 'partyNotifications',
    subtitle: '새 파티 생성, 파티 동승 요청, 파티 상태 변경 알림',
    title: '택시파티 알림',
  },
  noticeNotifications: {
    iconKey: 'noticeNotifications',
    subtitle: '학교 공지사항 실시간 알림',
    title: '학교 공지사항 알림',
  },
  boardLikeNotifications: {
    iconKey: 'boardLikeNotifications',
    subtitle: '내 게시물에 좋아요 눌렸을 때 알림',
    title: '게시물 좋아요 알림',
  },
  boardCommentNotifications: {
    iconKey: 'boardCommentNotifications',
    subtitle: '내 게시물이나 내 댓글에 댓글/답글이 달렸을 때 알림',
    title: '댓글/답글 알림',
  },
  systemNotifications: {
    iconKey: 'systemNotifications',
    subtitle: '앱 업데이트, 서비스 점검, 보안 관련 알림',
    title: '시스템 알림',
  },
  marketingNotifications: {
    iconKey: 'marketingNotifications',
    subtitle: '이벤트, 프로모션, 추천 서비스 알림',
    title: '마케팅 알림',
  },
};

const resolveIcon = (iconKey: NotificationSettingIconKey) => {
  switch (iconKey) {
    case 'allNotifications':
      return {
        iconBackgroundColor: COLORS.brand.primaryTint,
        iconColor: COLORS.brand.primary,
        iconName: 'notifications-outline',
      };
    case 'partyNotifications':
      return {
        iconBackgroundColor: COLORS.accent.orangeSoft,
        iconColor: COLORS.accent.orange,
        iconName: 'car-outline',
      };
    case 'noticeNotifications':
      return {
        iconBackgroundColor: COLORS.accent.blueSoft,
        iconColor: COLORS.accent.blue,
        iconName: 'megaphone-outline',
      };
    case 'boardLikeNotifications':
      return {
        iconBackgroundColor: COLORS.accent.pinkSoft,
        iconColor: COLORS.status.danger,
        iconName: 'heart-outline',
      };
    case 'boardCommentNotifications':
      return {
        iconBackgroundColor: COLORS.brand.primaryTint,
        iconColor: COLORS.brand.primary,
        iconName: 'chatbubble-outline',
      };
    case 'systemNotifications':
      return {
        iconBackgroundColor: COLORS.accent.purpleSoft,
        iconColor: COLORS.accent.purple,
        iconName: 'shield-checkmark-outline',
      };
    case 'marketingNotifications':
    default:
      return {
        iconBackgroundColor: COLORS.accent.pinkSoft,
        iconColor: COLORS.accent.pink,
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
