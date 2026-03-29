import React from 'react';

import {useAuth} from '@/features/auth';
import {useCafeteriaRepository} from '@/di/useRepository';

import {buildCafeteriaDetailSections} from '../application/cafeteriaMenuAssembler';
import type {
  CafeteriaMenuEntry,
  CafeteriaMenuReactionSummary,
  CafeteriaMenuReactionType,
  WeeklyMenu,
} from '../model/cafeteria';
import type {CafeteriaDetailScreenViewData} from '../model/cafeteriaDetailViewData';

const formatCountLabel = (count: number) =>
  new Intl.NumberFormat('ko-KR').format(count);

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
        countLabel: formatCountLabel(item.dislikeCount),
        iconName: 'thumbs-down-outline',
        isSelected: item.myReaction === 'DISLIKE',
      },
      primaryReaction: {
        countLabel: formatCountLabel(item.likeCount),
        iconName: 'thumbs-up-outline',
        isSelected: item.myReaction === 'LIKE',
      },
      title: item.title,
    })),
    title: category.title,
  })),
  title: '학식 메뉴',
});

const findMenuEntryById = (menu: WeeklyMenu, menuId: string) => {
  for (const categories of Object.values(menu.menuEntries)) {
    for (const entries of Object.values(categories)) {
      const matchedEntry = entries.find(entry => entry.id === menuId);

      if (matchedEntry) {
        return matchedEntry;
      }
    }
  }

  return null;
};

const getOptimisticReactionSummary = (
  entry: CafeteriaMenuEntry,
  requestedReaction: CafeteriaMenuReactionType | null,
): CafeteriaMenuReactionSummary => {
  let likeCount = entry.likeCount;
  let dislikeCount = entry.dislikeCount;

  if (entry.myReaction === 'LIKE') {
    likeCount = Math.max(0, likeCount - 1);
  }

  if (entry.myReaction === 'DISLIKE') {
    dislikeCount = Math.max(0, dislikeCount - 1);
  }

  if (requestedReaction === 'LIKE') {
    likeCount += 1;
  }

  if (requestedReaction === 'DISLIKE') {
    dislikeCount += 1;
  }

  return {
    dislikeCount,
    likeCount,
    menuId: entry.id,
    myReaction: requestedReaction,
  };
};

const applyReactionSummary = (
  menu: WeeklyMenu,
  summary: CafeteriaMenuReactionSummary,
): WeeklyMenu => ({
  ...menu,
  menuEntries: Object.fromEntries(
    Object.entries(menu.menuEntries).map(([date, categories]) => [
      date,
      Object.fromEntries(
        Object.entries(categories).map(([categoryCode, entries]) => [
          categoryCode,
          entries.map(entry =>
            entry.id === summary.menuId
              ? {
                  ...entry,
                  dislikeCount: summary.dislikeCount,
                  likeCount: summary.likeCount,
                  myReaction: summary.myReaction,
                }
              : entry,
          ),
        ]),
      ),
    ]),
  ),
});

export const useCafeteriaDetailData = () => {
  const {user} = useAuth();
  const cafeteriaRepository = useCafeteriaRepository();

  const [menu, setMenu] = React.useState<WeeklyMenu>();
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const [pendingReactionMenuId, setPendingReactionMenuId] = React.useState<
    string | null
  >(null);

  const data = React.useMemo(() => {
    if (!menu) {
      return undefined;
    }

    const sections = buildCafeteriaDetailSections({
      menu,
    });

    return toScreenViewData(sections);
  }, [menu]);

  const reload = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const nextMenu = await cafeteriaRepository.getCurrentWeekMenu();

      if (!nextMenu) {
        setMenu(undefined);
        setError('이번 주 학식 메뉴가 없습니다.');
        return;
      }

      setMenu(nextMenu);
    } catch (caughtError) {
      console.error('Failed to fetch cafeteria detail menu', caughtError);
      setError('학식 메뉴를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [cafeteriaRepository]);

  const upsertReaction = React.useCallback(
    async (menuId: string, reaction: CafeteriaMenuReactionType) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      if (!menu || pendingReactionMenuId === menuId) {
        return;
      }

      const targetEntry = findMenuEntryById(menu, menuId);

      if (!targetEntry) {
        throw new Error('반응 대상을 찾지 못했습니다.');
      }

      const requestedReaction =
        targetEntry.myReaction === reaction ? null : reaction;
      const previousMenu = menu;
      const optimisticSummary = getOptimisticReactionSummary(
        targetEntry,
        requestedReaction,
      );

      setPendingReactionMenuId(menuId);
      setMenu(currentMenu =>
        currentMenu ? applyReactionSummary(currentMenu, optimisticSummary) : currentMenu,
      );

      try {
        const summary = await cafeteriaRepository.upsertMenuReaction(
          menuId,
          requestedReaction,
        );

        setMenu(currentMenu =>
          currentMenu ? applyReactionSummary(currentMenu, summary) : currentMenu,
        );
      } catch (caughtError) {
        setMenu(previousMenu);
        throw caughtError;
      } finally {
        setPendingReactionMenuId(currentMenuId =>
          currentMenuId === menuId ? null : currentMenuId,
        );
      }
    },
    [cafeteriaRepository, menu, pendingReactionMenuId, user?.uid],
  );

  React.useEffect(() => {
    reload().catch(() => undefined);
  }, [reload]);

  return {
    data,
    error,
    loading,
    pendingReactionMenuId,
    reload,
    upsertReaction,
  };
};
