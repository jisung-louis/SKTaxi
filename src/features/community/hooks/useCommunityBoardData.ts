import React from 'react';
import {format, formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {CommunityStackParamList} from '@/app/navigation/types';
import {
  useBoardPosts,
  type BoardPost,
  type BoardSearchFilters,
} from '@/features/board';

import type {
  CommunityBoardFeaturedViewData,
  CommunityBoardPostViewData,
} from '../model/communityViewData';

const BOARD_CATEGORY_LABEL_MAP: Record<BoardPost['category'], string> = {
  announcement: '정보게시판',
  general: '자유게시판',
  question: '질문게시판',
  review: '후기게시판',
};

const DEFAULT_FILTERS: BoardSearchFilters = {
  sortBy: 'latest',
};

const formatBoardListTimeLabel = (date: Date) => {
  return format(date, 'M월 d일 a h:mm', {locale: ko});
};

const toFeaturedViewData = (
  post: BoardPost,
): CommunityBoardFeaturedViewData => ({
  categoryLabel: BOARD_CATEGORY_LABEL_MAP[post.category],
  commentCount: post.commentCount,
  id: post.id,
  likeCount: post.likeCount,
  timeLabel: formatDistanceToNow(post.createdAt, {addSuffix: true, locale: ko}),
  title: post.title,
});

const toBoardPostViewData = (post: BoardPost): CommunityBoardPostViewData => ({
  authorLabel: post.isAnonymous ? '익명' : post.authorName,
  bookmarkCount: post.bookmarkCount,
  categoryLabel: BOARD_CATEGORY_LABEL_MAP[post.category],
  commentCount: post.commentCount,
  excerpt: post.content,
  id: post.id,
  likeCount: post.likeCount,
  timeLabel: formatBoardListTimeLabel(post.createdAt),
  title: post.title,
});

interface UseCommunityBoardDataParams {
  navigation: NativeStackNavigationProp<CommunityStackParamList>;
}

export const useCommunityBoardData = ({
  navigation,
}: UseCommunityBoardDataParams) => {
  const [searchFilters, setSearchFilters] =
    React.useState<BoardSearchFilters>(DEFAULT_FILTERS);
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const {error, hasMore, loadMore, loading, loadingMore, posts, refresh} =
    useBoardPosts(searchFilters);
  const {
    loading: featuredLoading,
    posts: popularPosts,
    refresh: refreshPopular,
  } = useBoardPosts({sortBy: 'popular'});

  const hasActiveSearch =
    Boolean(searchFilters.searchText) || Boolean(searchFilters.category);

  const featuredPost = React.useMemo(() => {
    if (hasActiveSearch) {
      return undefined;
    }

    return popularPosts[0] ? toFeaturedViewData(popularPosts[0]) : undefined;
  }, [hasActiveSearch, popularPosts]);

  const items = React.useMemo(
    () => posts.map(post => toBoardPostViewData(post)),
    [posts],
  );

  React.useEffect(() => {
    if (refreshing && !loading && !featuredLoading) {
      setRefreshing(false);
    }
  }, [featuredLoading, loading, refreshing]);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    refresh();
    refreshPopular();
  }, [refresh, refreshPopular]);

  const handleOpenPost = React.useCallback(
    (postId: string) => {
      navigation.navigate('BoardDetail', {postId});
    },
    [navigation],
  );

  const handleOpenWrite = React.useCallback(() => {
    navigation.navigate('BoardWrite');
  }, [navigation]);

  const handleApplySearch = React.useCallback((filters: BoardSearchFilters) => {
    setSearchFilters(filters);
  }, []);

  const handleClearSearch = React.useCallback(() => {
    setSearchFilters(DEFAULT_FILTERS);
  }, []);

  const handleApplyRouteSearch = React.useCallback((searchText: string) => {
    setSearchFilters({
      searchText,
      sortBy: 'latest',
    });
  }, []);

  return {
    error,
    featuredPost,
    filters: searchFilters,
    handleApplyRouteSearch,
    handleApplySearch,
    handleClearSearch,
    handleOpenPost,
    handleOpenWrite,
    handleRefresh,
    hasMore,
    items,
    loadMore,
    loading,
    loadingMore,
    refreshing,
    searchVisible,
    setSearchVisible,
  };
};
