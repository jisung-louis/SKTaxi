import React from 'react';

import {useCafeteriaRepository} from '@/di/useRepository';
import {COLORS} from '@/shared/design-system/tokens';

import {buildCafeteriaDetailSections} from '../application/cafeteriaMenuAssembler';
import type {
  CafeteriaMenuBadgeTone,
} from '../model/cafeteriaDetailSource';
import {formatLocalDateKey} from '../model/cafeteria';
import type {CafeteriaDetailScreenViewData} from '../model/cafeteriaDetailViewData';

const getBadgeToneColors = (tone: CafeteriaMenuBadgeTone) => {
  if (tone === 'blue') {
    return {
      backgroundColor: COLORS.accent.blueSoft,
      textColor: COLORS.accent.blue,
    };
  }

  return {
    backgroundColor: COLORS.brand.primaryTint,
    textColor: COLORS.brand.primaryStrong,
  };
};

const toScreenViewData = (
  sections: ReturnType<typeof buildCafeteriaDetailSections>,
): CafeteriaDetailScreenViewData => ({
  categories: sections.map(category => ({
    id: category.id,
    items: category.items.map(item => ({
      badges: item.badges.map(badge => {
        const colors = getBadgeToneColors(badge.tone);

        return {
          backgroundColor: colors.backgroundColor,
          id: badge.id,
          label: badge.label,
          textColor: colors.textColor,
        };
      }),
      id: item.id,
      negativeReaction: {
        countLabel: '',
        iconName: 'thumbs-down-outline',
      },
      priceLabel: item.metaLabel,
      primaryReaction: {
        countLabel: '',
        iconName: 'thumbs-up-outline',
      },
      title: item.title,
    })),
    title: category.title,
  })),
  title: '학식 메뉴',
});

export const useCafeteriaDetailData = () => {
  const cafeteriaRepository = useCafeteriaRepository();

  const [data, setData] = React.useState<CafeteriaDetailScreenViewData>();
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const menu = await cafeteriaRepository.getCurrentWeekMenu();

      if (!menu) {
        setData(undefined);
        setError('이번 주 학식 메뉴가 없습니다.');
        return;
      }

      const sections = buildCafeteriaDetailSections({
        currentDate: formatLocalDateKey(new Date()),
        menu,
      });

      setData(toScreenViewData(sections));
    } catch (caughtError) {
      console.error('Failed to fetch cafeteria detail menu', caughtError);
      setError('학식 메뉴를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [cafeteriaRepository]);

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
