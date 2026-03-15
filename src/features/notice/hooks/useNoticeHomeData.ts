import React from 'react';

import {useNoticeSettings} from './useNoticeSettings';
import {useNotices} from './useNotices';
import {isNoticeRead, toNoticeTimestampMillis} from '../model/selectors';
import type {Notice} from '../model/types';
import type {
  NoticeHomeCategoryDefinition,
  NoticeHomeCategoryId,
  NoticeHomeNoticeItemViewData,
  NoticeHomeTone,
  NoticeHomeViewData,
} from '../model/noticeHomeViewData';

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
  학사: '학사',
};

const CATEGORY_TONE_MAP: Record<string, NoticeHomeTone> = {
  시설: 'gray',
  장학: 'purple',
  취업: 'orange',
  행사: 'pink',
  학사: 'blue',
};

const formatNoticeDateLabel = (value: unknown) => {
  const timestamp = toNoticeTimestampMillis(value);

  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
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

const filterNoticesByCategory = ({
  notices,
  selectedCategory,
}: {
  notices: Notice[];
  selectedCategory: NoticeHomeCategoryDefinition;
}) => {
  if (selectedCategory.id === 'all') {
    return notices;
  }

  return notices.filter(notice =>
    selectedCategory.sourceCategories.includes(notice.category),
  );
};

const mapNoticeToViewData = ({
  notice,
  readStatus,
  userJoinedAt,
}: {
  notice: Notice;
  readStatus: Record<string, boolean>;
  userJoinedAt: unknown;
}): NoticeHomeNoticeItemViewData => {
  const categoryLabel = getCategoryDisplayLabel(notice.category);
  const isUnread = !isNoticeRead(notice, readStatus, userJoinedAt);

  return {
    categoryLabel,
    categoryTone: getCategoryTone(categoryLabel),
    dateLabel: formatNoticeDateLabel(notice.postedAt),
    id: notice.id,
    isUnread,
    title: notice.title,
  };
};

const buildNoticeHomeViewData = ({
  notices,
  readStatus,
  selectedCategoryId,
  userJoinedAt,
}: {
  notices: Notice[];
  readStatus: Record<string, boolean>;
  selectedCategoryId: NoticeHomeCategoryId;
  userJoinedAt: unknown;
}): NoticeHomeViewData => {
  const selectedCategory =
    NOTICE_HOME_CATEGORIES.find(
      category => category.id === selectedCategoryId,
    ) ?? NOTICE_HOME_CATEGORIES[0];
  const filteredNotices = filterNoticesByCategory({notices, selectedCategory});
  const filteredItems = filteredNotices.map(notice =>
    mapNoticeToViewData({
      notice,
      readStatus,
      userJoinedAt,
    }),
  );
  const firstUnreadNoticeId = filteredItems.find(item => item.isUnread)?.id;
  const filteredUnreadCount = filteredItems.filter(
    item => item.isUnread,
  ).length;

  return {
    banner: {
      actionLabel: filteredUnreadCount > 0 ? '보기' : undefined,
      description:
        filteredUnreadCount > 0
          ? `${filteredUnreadCount}개의 새로운 공지가 있어요`
          : '새로운 공지를 모두 확인했어요',
      hasUnread: filteredUnreadCount > 0,
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
    items: filteredItems,
    subtitle: '성결대학교 최신 공지를 확인하세요',
    title: '공지사항',
  };
};

export const useNoticeHomeData = () => {
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<NoticeHomeCategoryId>('all');

  const selectedCategory =
    NOTICE_HOME_CATEGORIES.find(
      category => category.id === selectedCategoryId,
    ) ?? NOTICE_HOME_CATEGORIES[0];

  const noticeResult = useNotices(selectedCategory.repositoryCategory);
  const settingsResult = useNoticeSettings();

  const data = React.useMemo(
    () =>
      buildNoticeHomeViewData({
        notices: noticeResult.notices,
        readStatus: noticeResult.readStatus,
        selectedCategoryId,
        userJoinedAt: noticeResult.userJoinedAt,
      }),
    [
      noticeResult.notices,
      noticeResult.readStatus,
      noticeResult.userJoinedAt,
      selectedCategoryId,
    ],
  );

  return {
    data,
    error: noticeResult.error,
    hasMore: noticeResult.hasMore,
    loadMore: noticeResult.loadMore,
    loading: noticeResult.loading,
    loadingMore: noticeResult.loadingMore,
    markAsRead: noticeResult.markAsRead,
    noticeSettings: settingsResult.settings,
    noticeSettingsError: settingsResult.error,
    noticeSettingsLoading: settingsResult.loading,
    refreshReadStatus: noticeResult.refreshReadStatus,
    selectCategory: setSelectedCategoryId,
    updateDetail: settingsResult.updateDetail,
    updateMaster: settingsResult.updateMaster,
    userJoinedAtLoaded: noticeResult.userJoinedAtLoaded,
  };
};
