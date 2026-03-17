import React from 'react';

import {V2_COLORS} from '@/shared/design-system/tokens';

import {myPageRepository} from '../data/repositories/myPageRepository';
import type {
  MyPageMenuTone,
  MyPageSource,
} from '../model/myPageSource';
import type {MyPageScreenViewData} from '../model/myPageViewData';

const getToneColors = (tone: MyPageMenuTone) => {
  switch (tone) {
    case 'blue':
      return {
        iconBackgroundColor: V2_COLORS.accent.blueSoft,
        iconColor: V2_COLORS.accent.blue,
      };
    case 'green':
      return {
        iconBackgroundColor: V2_COLORS.brand.primaryTint,
        iconColor: V2_COLORS.brand.primary,
      };
    case 'orange':
      return {
        iconBackgroundColor: V2_COLORS.accent.orangeSoft,
        iconColor: V2_COLORS.accent.orange,
      };
    case 'purple':
      return {
        iconBackgroundColor: V2_COLORS.accent.purpleSoft,
        iconColor: V2_COLORS.accent.purple,
      };
    case 'pink':
      return {
        iconBackgroundColor: V2_COLORS.accent.pinkSoft,
        iconColor: V2_COLORS.accent.pink,
      };
    case 'gray':
    default:
      return {
        iconBackgroundColor: V2_COLORS.background.subtle,
        iconColor: V2_COLORS.text.secondary,
      };
  }
};

const toViewData = (source: MyPageSource): MyPageScreenViewData => ({
  logoutLabel: source.logoutLabel,
  profile: {
    avatarLabel: source.profile.displayName.slice(0, 1) || '?',
    displayName: source.profile.displayName,
    editLabel: source.profile.editLabel,
    subtitle: source.profile.subtitle,
  },
  sections: source.sections.map(section => ({
    id: section.id,
    items: section.items.map(item => {
      const toneColors = getToneColors(item.tone);

      return {
        actionKey: item.actionKey,
        iconBackgroundColor: toneColors.iconBackgroundColor,
        iconColor: toneColors.iconColor,
        iconName: item.iconName,
        id: item.id,
        label: item.label,
      };
    }),
    title: section.title,
  })),
  stats: source.stats.map(stat => ({
    id: stat.id,
    label: stat.label,
    valueLabel: `${stat.value}`,
  })),
  withdrawLabel: source.withdrawLabel,
});

export const useMyPageData = () => {
  const [data, setData] = React.useState<MyPageScreenViewData>();
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const source = await myPageRepository.getMyPage();
      setData(toViewData(source));
    } catch (caughtError) {
      console.error('Failed to fetch my page data', caughtError);
      setError('마이페이지를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload().catch(() => undefined);
  }, [reload]);

  return {
    data,
    error,
    loading,
    reload,
  };
};
