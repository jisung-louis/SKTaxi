import React from 'react';

import {formatKoreanRelativeTime} from '@/shared/lib/date';

import type {Notice} from '../model/types';
import {isNoticeRead} from '../model/selectors';
import type {
  NoticeHomeCategoryDefinition,
  NoticeHomeCategoryId,
  NoticeHomeNoticeItemViewData,
  NoticeHomeTone,
  NoticeHomeViewData,
} from '../model/noticeHomeViewData';
import {useNotices} from './useNotices';
import {useNoticeSettings} from './useNoticeSettings';

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

const getCategoryDisplayLabel = (category: string) =>
  CATEGORY_DISPLAY_LABEL_MAP[category] ?? category.split('/')[0] ?? category;

const getCategoryTone = (label: string): NoticeHomeTone =>
  CATEGORY_TONE_MAP[label] ?? 'gray';

const mapNoticeToViewData = (
  notice: Notice,
  isUnread: boolean,
): NoticeHomeNoticeItemViewData => {
  const categoryLabel = getCategoryDisplayLabel(notice.category);

  return {
    bookmarkCount: notice.bookmarkCount ?? 0,
    categoryLabel,
    categoryTone: getCategoryTone(categoryLabel),
    commentCount: notice.commentCount ?? 0,
    id: notice.id,
    isUnread,
    likeCount: notice.likeCount ?? 0,
    timeLabel: formatKoreanRelativeTime(notice.postedAt),
    title: notice.title,
  };
};

const buildNoticeHomeViewData = ({
  firstUnreadNoticeId,
  items,
  readStatus,
  selectedCategoryId,
  unreadCount,
  userJoinedAt,
}: {
  firstUnreadNoticeId?: string;
  items: Notice[];
  readStatus: Record<string, boolean>;
  selectedCategoryId: NoticeHomeCategoryId;
  unreadCount: number;
  userJoinedAt: unknown;
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
    items: items.map(notice =>
      mapNoticeToViewData(
        notice,
        !isNoticeRead(notice, readStatus, userJoinedAt),
      ),
    ),
    subtitle: '성결대학교 최신 공지를 확인하세요',
    title: '공지사항',
  };
};

const getSelectedCategoryDefinition = (
  selectedCategoryId: NoticeHomeCategoryId,
) =>
  NOTICE_HOME_CATEGORIES.find(category => category.id === selectedCategoryId) ??
  NOTICE_HOME_CATEGORIES[0];

export const useNoticeHomeData = () => {
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<NoticeHomeCategoryId>('all');
  const selectedCategory = React.useMemo(
    () => getSelectedCategoryDefinition(selectedCategoryId),
    [selectedCategoryId],
  );

  const {
    error,
    hasMore,
    loadMore,
    loading,
    loadingMore,
    markAsRead,
    notices,
    readStatus,
    refresh,
    unreadCount,
    userJoinedAt,
    userJoinedAtLoaded,
  } = useNotices(selectedCategory.repositoryCategory);
  const {
    error: noticeSettingsError,
    loading: noticeSettingsLoading,
    settings: noticeSettings,
    updateDetail,
    updateMaster,
  } = useNoticeSettings();

  const firstUnreadNoticeId = React.useMemo(
    () =>
      notices.find(notice => !isNoticeRead(notice, readStatus, userJoinedAt))
        ?.id,
    [notices, readStatus, userJoinedAt],
  );

  const data = React.useMemo(
    () =>
      buildNoticeHomeViewData({
        firstUnreadNoticeId,
        items: notices,
        readStatus,
        selectedCategoryId,
        unreadCount,
        userJoinedAt,
      }),
    [
      firstUnreadNoticeId,
      notices,
      readStatus,
      selectedCategoryId,
      unreadCount,
      userJoinedAt,
    ],
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
    refresh,
    selectCategory: setSelectedCategoryId,
    updateDetail,
    updateMaster,
    userJoinedAtLoaded,
  };
};
