import React from 'react';

import {V2_COLORS} from '@/shared/design-system/tokens';

import {cafeteriaDetailRepository} from '../data/repositories/cafeteriaDetailRepository';
import type {
  CafeteriaMenuBadgeTone,
  CafeteriaMenuItemSource,
  CafeteriaDetailSource,
} from '../model/cafeteriaDetailSource';
import type {CafeteriaDetailScreenViewData} from '../model/cafeteriaDetailViewData';

const formatPriceLabel = (price: number) => `${price.toLocaleString('ko-KR')}원`;

const getBadgeToneColors = (tone: CafeteriaMenuBadgeTone) => {
  if (tone === 'blue') {
    return {
      backgroundColor: V2_COLORS.accent.blueSoft,
      textColor: V2_COLORS.accent.blue,
    };
  }

  return {
    backgroundColor: V2_COLORS.brand.primaryTint,
    textColor: V2_COLORS.brand.primaryStrong,
  };
};

const toMenuItemViewData = (item: CafeteriaMenuItemSource) => ({
  badges: (item.badges ?? []).map(badge => {
    const colors = getBadgeToneColors(badge.tone);

    return {
      backgroundColor: colors.backgroundColor,
      id: badge.id,
      label: badge.label,
      textColor: colors.textColor,
    };
  }),
  id: item.id,
  priceLabel: formatPriceLabel(item.price),
  primaryReaction: {
    countLabel: `${item.positiveCount}`,
    iconName: 'thumbs-up-outline',
  },
  negativeReaction: {
    countLabel: `${item.secondaryCount}`,
    iconName: 'thumbs-down-outline',
  },
  title: item.title,
});

const toScreenViewData = (
  source: CafeteriaDetailSource,
): CafeteriaDetailScreenViewData => ({
  categories: source.categories.map(category => ({
    id: category.id,
    items: category.items.map(toMenuItemViewData),
    title: category.title,
  })),
  title: '학식 메뉴',
});

export const useCafeteriaDetailData = () => {
  const [data, setData] = React.useState<CafeteriaDetailScreenViewData>();
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const source = await cafeteriaDetailRepository.getMenu();
      setData(toScreenViewData(source));
    } catch (caughtError) {
      console.error('Failed to fetch cafeteria detail menu', caughtError);
      setError('학식 메뉴를 불러오지 못했습니다.');
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
