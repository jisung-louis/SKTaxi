// SKTaxi: 게시판 게시물 훅 - Repository 패턴 적용
// 게시물 목록 조회, 페이지네이션, 실시간 구독

import { useState, useEffect, useCallback, useRef } from 'react';
import { useBoardRepository } from '../../di';
import { BoardPost, BoardSearchFilters } from '../../types/board';
import { BoardFilterOptions } from '../../repositories/interfaces';

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

/**
 * BoardSearchFilters를 Repository의 BoardFilterOptions로 변환
 */
function toFilterOptions(filters: BoardSearchFilters): BoardFilterOptions {
  return {
    category: filters.category,
    authorId: filters.authorId,
    searchText: filters.searchText,
    sortBy: filters.sortBy,
  };
}

/**
 * 클라이언트 사이드 검색 필터링
 * (Firestore는 전문 검색을 지원하지 않으므로 클라이언트에서 처리)
 */
function filterBySearchText(posts: BoardPost[], searchText?: string): BoardPost[] {
  if (!searchText) {return posts;}

  const searchLower = searchText.toLowerCase();
  return posts.filter((post) => {
    // 일반 텍스트 검색
    const textMatch =
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.authorName.toLowerCase().includes(searchLower);

    // 해시태그 검색 (#으로 시작하는 경우)
    const hashtagMatch = searchLower.startsWith('#')
      ? post.content.includes(searchLower)
      : post.content.includes(`#${searchLower}`);

    return textMatch || hashtagMatch;
  });
}

/**
 * 게시판 게시물 훅 - Repository 패턴 사용
 *
 * @param filters - 검색/필터 옵션
 * @returns 게시물 목록 및 페이지네이션 상태
 */
export function useBoardPosts(
  filters: BoardSearchFilters = { sortBy: 'latest' }
): UseBoardPostsResult {
  const boardRepository = useBoardRepository();

  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<unknown>(null);
  const isMountedRef = useRef<boolean>(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // 초기 로드 및 실시간 구독
  const loadAndSubscribe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterOptions = toFilterOptions(filters);

      // 기존 구독 해제
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // 실시간 구독 시작
      unsubscribeRef.current = boardRepository.subscribeToPosts(
        filterOptions,
        POSTS_PER_PAGE,
        {
          onData: (newPosts: BoardPost[]) => {
            if (!isMountedRef.current) {return;}

            // 클라이언트 사이드 검색 필터링
            const filteredPosts = filterBySearchText(newPosts, filters.searchText);
            setPosts(filteredPosts);
            setLoading(false);
            setError(null);
          },
          onError: (err: Error) => {
            if (!isMountedRef.current) {return;}
            console.error('게시글 구독 실패:', err);
            setError('게시글을 불러오는데 실패했습니다.');
            setLoading(false);
          },
        }
      );

      // 초기 데이터 로드 (커서 설정용)
      const result = await boardRepository.getPosts(filterOptions, POSTS_PER_PAGE);
      if (isMountedRef.current) {
        cursorRef.current = result.cursor;
        setHasMore(result.hasMore);
      }
    } catch (err) {
      console.error('게시글 로드 실패:', err);
      if (isMountedRef.current) {
        setError('게시글을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    }
  }, [boardRepository, filters]);

  // 더 많은 게시물 로드
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) {return;}

    try {
      setLoadingMore(true);

      const filterOptions = toFilterOptions(filters);
      const result = await boardRepository.getMorePosts(
        filterOptions,
        cursorRef.current,
        POSTS_PER_PAGE
      );

      if (!isMountedRef.current) {return;}

      // 클라이언트 사이드 검색 필터링
      const filteredNewPosts = filterBySearchText(result.data, filters.searchText);

      setPosts((prev) => [...prev, ...filteredNewPosts]);
      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('게시글 더 로드 실패:', err);
      if (isMountedRef.current) {
        setError('게시글을 더 불러오는데 실패했습니다.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [boardRepository, filters, loadingMore, hasMore]);

  // 새로고침
  const refresh = useCallback(() => {
    setPosts([]);
    cursorRef.current = null;
    setHasMore(true);
    loadAndSubscribe();
  }, [loadAndSubscribe]);

  // 필터 변경 시 재로드
  useEffect(() => {
    isMountedRef.current = true;
    loadAndSubscribe();

    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
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
