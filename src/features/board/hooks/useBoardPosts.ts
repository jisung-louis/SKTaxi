import { useCallback, useEffect, useRef, useState } from 'react';

import type { BoardPost, BoardSearchFilters } from '../model/types';
import type { BoardFilterOptions } from '../data/repositories/IBoardRepository';
import { filterVisibleBoardPosts } from '../services/boardModerationService';
import {
  filterBoardPostsBySearchText,
  toBoardFilterOptions,
} from '../services/boardPostService';
import { useBoardRepository } from './useBoardRepository';

const POSTS_PER_PAGE = 20;

export interface UseBoardPostsResult {
  posts: BoardPost[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => void;
}

async function resolveVisiblePosts(
  posts: BoardPost[],
  filters: BoardSearchFilters,
): Promise<BoardPost[]> {
  const searchedPosts = filterBoardPostsBySearchText(posts, filters.searchText);

  try {
    return await filterVisibleBoardPosts(searchedPosts);
  } catch {
    return searchedPosts;
  }
}

export function useBoardPosts(
  filters: BoardSearchFilters = { sortBy: 'latest' },
): UseBoardPostsResult {
  const boardRepository = useBoardRepository();

  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<unknown>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const applyPosts = useCallback(
    async (nextPosts: BoardPost[], requestId: number, append = false) => {
      const visiblePosts = await resolveVisiblePosts(nextPosts, filters);
      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setPosts((prev) => (append ? [...prev, ...visiblePosts] : visiblePosts));
      setLoading(false);
      setError(null);
    },
    [filters],
  );

  const loadAndSubscribe = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      setLoading(true);
      setError(null);

      const filterOptions: BoardFilterOptions = toBoardFilterOptions(filters);

      unsubscribeRef.current?.();
      unsubscribeRef.current = boardRepository.subscribeToPosts(filterOptions, POSTS_PER_PAGE, {
        onData: (nextPosts) => {
          void applyPosts(nextPosts, requestId);
        },
        onError: (err) => {
          if (!isMountedRef.current || requestId !== requestIdRef.current) {
            return;
          }
          console.error('게시글 구독 실패:', err);
          setError('게시글을 불러오는데 실패했습니다.');
          setLoading(false);
        },
      });

      const result = await boardRepository.getPosts(filterOptions, POSTS_PER_PAGE);
      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('게시글 로드 실패:', err);
      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return;
      }
      setError('게시글을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  }, [applyPosts, boardRepository, filters]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) {
      return;
    }

    const requestId = requestIdRef.current;

    try {
      setLoadingMore(true);
      const result = await boardRepository.getMorePosts(
        toBoardFilterOptions(filters),
        cursorRef.current,
        POSTS_PER_PAGE,
      );

      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
      await applyPosts(result.data, requestId, true);
    } catch (err) {
      console.error('게시글 더 로드 실패:', err);
      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return;
      }
      setError('게시글을 더 불러오는데 실패했습니다.');
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setLoadingMore(false);
      }
    }
  }, [applyPosts, boardRepository, filters, hasMore, loadingMore]);

  const refresh = useCallback(() => {
    setPosts([]);
    cursorRef.current = null;
    setHasMore(true);
    void loadAndSubscribe();
  }, [loadAndSubscribe]);

  useEffect(() => {
    isMountedRef.current = true;
    void loadAndSubscribe();

    return () => {
      isMountedRef.current = false;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [loadAndSubscribe]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}
