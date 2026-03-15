import React from 'react';
import {Alert} from 'react-native';
import {format, formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {
  CommunityBoardFeaturedViewData,
  CommunityBoardPostViewData,
} from '../model/communityViewData';
import type {
  CommunityBoardSearchFilters,
  CommunityBoardSourceItem,
} from '../model/communityHomeData';
import {communityHomeRepository} from '../data/repositories/communityHomeRepository';
import type {CommunityStackParamList} from '@/app/navigation/types';

const PAGE_SIZE = 5;

const BOARD_CATEGORY_LABEL_MAP: Record<
  CommunityBoardSourceItem['category'],
  string
> = {
  announcement: '정보게시판',
  general: '자유게시판',
  question: '질문게시판',
  review: '후기게시판',
};

const DEFAULT_FILTERS: CommunityBoardSearchFilters = {
  sortBy: 'latest',
};

const formatBoardListTimeLabel = (date: Date) => {
  return format(date, 'M월 d일 a h:mm', {locale: ko});
};

const toFeaturedViewData = (
  post: CommunityBoardSourceItem,
): CommunityBoardFeaturedViewData => ({
  categoryLabel: BOARD_CATEGORY_LABEL_MAP[post.category],
  commentCount: post.commentCount,
  id: post.id,
  likeCount: post.likeCount,
  timeLabel: formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  }),
  title: post.title,
});

const toBoardPostViewData = (
  post: CommunityBoardSourceItem,
): CommunityBoardPostViewData => ({
  authorLabel: post.isAnonymous ? '익명' : post.authorName,
  bookmarkCount: post.bookmarkCount,
  categoryLabel: BOARD_CATEGORY_LABEL_MAP[post.category],
  commentCount: post.commentCount,
  excerpt: post.content,
  id: post.id,
  likeCount: post.likeCount,
  timeLabel: formatBoardListTimeLabel(new Date(post.createdAt)),
  title: post.title,
});

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '게시글을 다시 불러와주세요.';
};

export const useCommunityBoardData = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const [searchFilters, setSearchFilters] =
    React.useState<CommunityBoardSearchFilters>(DEFAULT_FILTERS);
  const [items, setItems] = React.useState<CommunityBoardPostViewData[]>([]);
  const [featuredPost, setFeaturedPost] = React.useState<
    CommunityBoardFeaturedViewData | undefined
  >(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [nextCursor, setNextCursor] = React.useState<string | undefined>(
    undefined,
  );
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const requestIdRef = React.useRef(0);
  const hasActiveSearch =
    Boolean(searchFilters.searchText) || Boolean(searchFilters.category);

  const fetchBoardPage = React.useCallback(
    async (mode: 'initial' | 'refresh' | 'loadMore', cursor?: string) => {
      const currentRequestId = requestIdRef.current + 1;
      requestIdRef.current = currentRequestId;

      if (mode === 'initial') {
        setLoading(true);
      }

      if (mode === 'refresh') {
        setRefreshing(true);
      }

      if (mode === 'loadMore') {
        setLoadingMore(true);
      }

      try {
        const result = await communityHomeRepository.getBoardPosts({
          cursor,
          filters: searchFilters,
          limit: PAGE_SIZE,
        });

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setError(null);
        setNextCursor(result.nextCursor);
        setFeaturedPost(
          hasActiveSearch || !result.featuredPost
            ? undefined
            : toFeaturedViewData(result.featuredPost),
        );
        setItems(previousItems =>
          mode === 'loadMore'
            ? [...previousItems, ...result.items.map(toBoardPostViewData)]
            : result.items.map(toBoardPostViewData),
        );
      } catch (fetchError) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setError(getErrorMessage(fetchError));

        if (mode !== 'loadMore') {
          setItems([]);
          setFeaturedPost(undefined);
          setNextCursor(undefined);
        }
      } finally {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [hasActiveSearch, searchFilters],
  );

  React.useEffect(() => {
    fetchBoardPage('initial').catch(() => undefined);
  }, [fetchBoardPage]);

  const handleRefresh = React.useCallback(() => {
    fetchBoardPage('refresh').catch(() => undefined);
  }, [fetchBoardPage]);

  const handleOpenPost = React.useCallback(
    (postId: string) => {
      navigation.navigate('BoardDetail', {postId});
    },
    [navigation],
  );

  const handleOpenWrite = React.useCallback(() => {
    Alert.alert(
      '준비 중',
      '글쓰기 기능은 Spring REST API 연동 단계에서 연결할 예정입니다.',
    );
  }, []);

  const handleApplySearch = React.useCallback(
    (filters: CommunityBoardSearchFilters) => {
      setSearchFilters(filters);
    },
    [],
  );

  const handleClearSearch = React.useCallback(() => {
    setSearchFilters(DEFAULT_FILTERS);
  }, []);

  const handleApplyRouteSearch = React.useCallback((searchText: string) => {
    setSearchFilters({
      searchText,
      sortBy: 'latest',
    });
  }, []);

  const loadMore = React.useCallback(async () => {
    if (loading || loadingMore || !nextCursor) {
      return;
    }

    await fetchBoardPage('loadMore', nextCursor);
  }, [fetchBoardPage, loading, loadingMore, nextCursor]);

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
    hasMore: Boolean(nextCursor),
    items,
    loadMore,
    loading,
    loadingMore,
    refreshing,
    searchVisible,
    setSearchVisible,
  };
};
