import React from 'react';

import {useCafeteriaRepository} from '@/di/useRepository';

import {buildCafeteriaDetailSections} from '../application/cafeteriaMenuAssembler';
import type {CafeteriaDetailScreenViewData} from '../model/cafeteriaDetailViewData';

const toScreenViewData = (
  sections: ReturnType<typeof buildCafeteriaDetailSections>,
): CafeteriaDetailScreenViewData => ({
  categories: sections.map(category => ({
    id: category.id,
    items: category.items.map(item => ({
      badges: item.badges.map(badge => ({
        id: badge.id,
        label: badge.label,
      })),
      id: item.id,
      negativeReaction: {
        countLabel: String(item.dislikeCount),
        iconName: 'thumbs-down-outline',
      },
      primaryReaction: {
        countLabel: String(item.likeCount),
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
