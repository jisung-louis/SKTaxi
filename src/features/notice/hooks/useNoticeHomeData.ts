import React from 'react';

import type {
  NoticeHomeSettings,
  NoticeHomeSourceItem,
} from '../model/noticeHomeData';
import type {
  NoticeHomeCategoryDefinition,
  NoticeHomeCategoryId,
  NoticeHomeNoticeItemViewData,
  NoticeHomeTone,
  NoticeHomeViewData,
} from '../model/noticeHomeViewData';
import {noticeHomeRepository} from '../data/repositories/noticeHomeRepository';

const NOTICE_HOME_CATEGORIES: NoticeHomeCategoryDefinition[] = [
  {
    id: 'all',
    label: '전체',
    repositoryCategory: '전체',
    sourceCategories: [],
  },
  {
    id: 'academic',
    label: '학사',
    repositoryCategory: '학사',
    sourceCategories: ['학사'],
  },
  {
    id: 'scholarship',
    label: '장학',
    repositoryCategory: '장학/등록/학자금',
    sourceCategories: ['장학/등록/학자금'],
  },
  {
    id: 'career',
    label: '취업',
    repositoryCategory: '취업/진로개발/창업',
    sourceCategories: ['취업/진로개발/창업'],
  },
  {
    id: 'event',
    label: '행사',
    repositoryCategory: '공모/행사',
    sourceCategories: ['공모/행사'],
  },
  {
    id: 'facility',
    label: '시설',
    repositoryCategory: '전체',
    sourceCategories: ['일반', '생활관', '입찰구매정보'],
  },
];

const DEFAULT_NOTICE_HOME_SETTINGS: NoticeHomeSettings = {
  noticeNotifications: true,
  noticeNotificationsDetail: {},
};

const CATEGORY_DISPLAY_LABEL_MAP: Record<string, string> = {
  '공모/행사': '행사',
  '장학/등록/학자금': '장학',
  '취업/진로개발/창업': '취업',
  생활관: '시설',
  시설: '시설',
  일반: '시설',
  입찰구매정보: '시설',
  학사: '학사',
};

const CATEGORY_TONE_MAP: Record<string, NoticeHomeTone> = {
  시설: 'gray',
  장학: 'purple',
  취업: 'orange',
  행사: 'pink',
  학사: 'blue',
};

const NOTICES_PER_PAGE = 20;

const formatNoticeDateLabel = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getCategoryDisplayLabel = (category: string) => {
  return (
    CATEGORY_DISPLAY_LABEL_MAP[category] ?? category.split('/')[0] ?? category
  );
};

const getCategoryTone = (label: string): NoticeHomeTone => {
  return CATEGORY_TONE_MAP[label] ?? 'gray';
};

const mapNoticeToViewData = (
  notice: NoticeHomeSourceItem,
): NoticeHomeNoticeItemViewData => {
  const categoryLabel = getCategoryDisplayLabel(notice.category);

  return {
    categoryLabel,
    categoryTone: getCategoryTone(categoryLabel),
    dateLabel: formatNoticeDateLabel(notice.postedAt),
    id: notice.id,
    isUnread: !notice.isRead,
    title: notice.title,
  };
};

const buildNoticeHomeViewData = ({
  firstUnreadNoticeId,
  items,
  selectedCategoryId,
  unreadCount,
}: {
  firstUnreadNoticeId?: string;
  items: NoticeHomeSourceItem[];
  selectedCategoryId: NoticeHomeCategoryId;
  unreadCount: number;
}): NoticeHomeViewData => {
  const selectedCategory =
    NOTICE_HOME_CATEGORIES.find(
      category => category.id === selectedCategoryId,
    ) ?? NOTICE_HOME_CATEGORIES[0];

  return {
    banner: {
      actionLabel: unreadCount > 0 ? '보기' : undefined,
      description:
        unreadCount > 0
          ? `${unreadCount}개의 새로운 공지가 있어요`
          : '새로운 공지를 모두 확인했어요',
      hasUnread: unreadCount > 0,
      title: '읽지 않은 공지',
    },
    categoryChips: NOTICE_HOME_CATEGORIES.map(category => ({
      id: category.id,
      label: category.label,
      selected: category.id === selectedCategoryId,
    })),
    emptyState: {
      description: `${selectedCategory.label} 카테고리의 공지가 아직 없습니다.`,
      title: '공지사항이 없습니다',
    },
    firstUnreadNoticeId,
    items: items.map(mapNoticeToViewData),
    subtitle: '성결대학교 최신 공지를 확인하세요',
    title: '공지사항',
  };
};

const getSelectedCategoryDefinition = (
  selectedCategoryId: NoticeHomeCategoryId,
) => {
  return (
    NOTICE_HOME_CATEGORIES.find(
      category => category.id === selectedCategoryId,
    ) ?? NOTICE_HOME_CATEGORIES[0]
  );
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const useNoticeHomeData = () => {
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<NoticeHomeCategoryId>('all');
  const [noticeItems, setNoticeItems] = React.useState<NoticeHomeSourceItem[]>(
    [],
  );
  const [noticeSettings, setNoticeSettings] =
    React.useState<NoticeHomeSettings>(DEFAULT_NOTICE_HOME_SETTINGS);
  const [error, setError] = React.useState<string | null>(null);
  const [noticeSettingsError, setNoticeSettingsError] = React.useState<
    string | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [noticeSettingsLoading, setNoticeSettingsLoading] =
    React.useState(true);
  const [hasMore, setHasMore] = React.useState(false);
  const [nextCursor, setNextCursor] = React.useState<string | undefined>(
    undefined,
  );
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [firstUnreadNoticeId, setFirstUnreadNoticeId] = React.useState<
    string | undefined
  >(undefined);
  const requestIdRef = React.useRef(0);

  const selectedCategory = React.useMemo(
    () => getSelectedCategoryDefinition(selectedCategoryId),
    [selectedCategoryId],
  );
  const selectedSourceCategories = React.useMemo(
    () =>
      selectedCategory.sourceCategories.length > 0
        ? selectedCategory.sourceCategories
        : undefined,
    [selectedCategory.sourceCategories],
  );

  const fetchNoticePage = React.useCallback(
    async (mode: 'initial' | 'refresh' | 'loadMore', cursor?: string) => {
      const currentRequestId = requestIdRef.current + 1;
      requestIdRef.current = currentRequestId;

      if (mode === 'initial') {
        setLoading(true);
      }

      if (mode === 'loadMore') {
        setLoadingMore(true);
      }

      try {
        const result = await noticeHomeRepository.getNoticePage({
          categories: selectedSourceCategories,
          cursor,
          limit: NOTICES_PER_PAGE,
        });

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setError(null);
        setHasMore(Boolean(result.nextCursor));
        setNextCursor(result.nextCursor);
        setUnreadCount(result.unreadCount);
        setFirstUnreadNoticeId(result.firstUnreadNoticeId);
        setNoticeItems(previousItems =>
          mode === 'loadMore'
            ? [...previousItems, ...result.items]
            : result.items,
        );
      } catch (fetchError) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setError(
          getErrorMessage(fetchError, '공지사항을 불러오지 못했습니다.'),
        );

        if (mode !== 'loadMore') {
          setNoticeItems([]);
          setHasMore(false);
          setNextCursor(undefined);
          setUnreadCount(0);
          setFirstUnreadNoticeId(undefined);
        }
      } finally {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedSourceCategories],
  );

  const fetchNoticeSettings = React.useCallback(async () => {
    setNoticeSettingsLoading(true);

    try {
      const nextSettings = await noticeHomeRepository.getNoticeSettings();
      setNoticeSettings(nextSettings);
      setNoticeSettingsError(null);
    } catch (settingsError) {
      setNoticeSettingsError(
        getErrorMessage(settingsError, '알림 설정을 불러오지 못했습니다.'),
      );
    } finally {
      setNoticeSettingsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNoticePage('initial').catch(() => undefined);
  }, [fetchNoticePage]);

  React.useEffect(() => {
    fetchNoticeSettings().catch(() => undefined);
  }, [fetchNoticeSettings]);

  const refreshReadStatus = React.useCallback(async () => {
    await Promise.all([fetchNoticePage('refresh'), fetchNoticeSettings()]);
  }, [fetchNoticePage, fetchNoticeSettings]);

  const loadMore = React.useCallback(async () => {
    if (loading || loadingMore || !nextCursor) {
      return;
    }

    await fetchNoticePage('loadMore', nextCursor);
  }, [fetchNoticePage, loading, loadingMore, nextCursor]);

  const markAsRead = React.useCallback(
    async (noticeId: string) => {
      await noticeHomeRepository.markNoticeAsRead(noticeId);

      setNoticeItems(previousItems =>
        previousItems.map(item =>
          item.id === noticeId ? {...item, isRead: true} : item,
        ),
      );

      const summary = await noticeHomeRepository.getUnreadSummary(
        selectedSourceCategories,
      );
      setUnreadCount(summary.unreadCount);
      setFirstUnreadNoticeId(summary.firstUnreadNoticeId);
    },
    [selectedSourceCategories],
  );

  const updateMaster = React.useCallback(async (enabled: boolean) => {
    try {
      const nextSettings = await noticeHomeRepository.updateNoticeMaster(
        enabled,
      );
      setNoticeSettings(nextSettings);
      setNoticeSettingsError(null);
    } catch (settingsError) {
      setNoticeSettingsError(
        getErrorMessage(settingsError, '설정 저장에 실패했습니다.'),
      );
    }
  }, []);

  const updateDetail = React.useCallback(
    async (categoryKey: string, enabled: boolean) => {
      try {
        const nextSettings = await noticeHomeRepository.updateNoticeDetail(
          categoryKey,
          enabled,
        );
        setNoticeSettings(nextSettings);
        setNoticeSettingsError(null);
      } catch (settingsError) {
        setNoticeSettingsError(
          getErrorMessage(settingsError, '설정 저장에 실패했습니다.'),
        );
      }
    },
    [],
  );

  const data = React.useMemo(
    () =>
      buildNoticeHomeViewData({
        firstUnreadNoticeId,
        items: noticeItems,
        selectedCategoryId,
        unreadCount,
      }),
    [firstUnreadNoticeId, noticeItems, selectedCategoryId, unreadCount],
  );

  return {
    data,
    error,
    hasMore,
    loadMore,
    loading,
    loadingMore,
    markAsRead,
    noticeSettings,
    noticeSettingsError,
    noticeSettingsLoading,
    refreshReadStatus,
    selectCategory: setSelectedCategoryId,
    updateDetail,
    updateMaster,
    userJoinedAtLoaded: true,
  };
};
