import { useState, useEffect, useCallback, useRef } from 'react';

import type { Notice, ReadStatusMap } from '../model/types';
import { useNoticeReadState } from './useNoticeReadState';
import { useNoticeRepository } from './useNoticeRepository';

const NOTICES_PER_PAGE = 20;

export interface UseNoticesResult {
  notices: Notice[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  unreadCount: number;
  readStatus: ReadStatusMap;
  readStatusLoading: boolean;
  markAsRead: (noticeId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  refreshReadStatus: () => Promise<void>;
  userJoinedAt: unknown;
  userJoinedAtLoaded: boolean;
}

/**
 * 공지사항 훅 - Repository 패턴 사용
 *
 * @param selectedCategory - 선택된 카테고리 ('전체' 또는 특정 카테고리)
 * @returns 공지 목록 및 읽음 상태
 */
export function useNotices(selectedCategory: string = '전체'): UseNoticesResult {
  const noticeRepository = useNoticeRepository();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [categoryCache, setCategoryCache] = useState<
    Record<
      string,
      {
        items: Notice[];
        cursor: unknown;
        hasMore: boolean;
        initialized: boolean;
      }
    >
  >({});

  const cursorRef = useRef<unknown>(null);
  const isMountedRef = useRef<boolean>(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const categoryCacheRef = useRef(categoryCache);

  useEffect(() => {
    categoryCacheRef.current = categoryCache;
  }, [categoryCache]);

  useEffect(() => {
    isMountedRef.current = true;
    const catKey = selectedCategory || '전체';

    const cached = categoryCacheRef.current[catKey];
    if (cached?.initialized) {
      setNotices(cached.items);
      cursorRef.current = cached.cursor;
      setHasMore(cached.hasMore);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    unsubscribeRef.current = noticeRepository.subscribeToNotices(
      catKey,
      NOTICES_PER_PAGE,
      {
        onData: (noticesData: Notice[]) => {
          if (!isMountedRef.current) {return;}

          setCategoryCache((prev) => ({
            ...prev,
            [catKey]: {
              items: noticesData,
              cursor: noticesData.length > 0 ? noticesData[noticesData.length - 1] : null,
              hasMore: noticesData.length === NOTICES_PER_PAGE,
              initialized: true,
            },
          }));

          setNotices(noticesData);
          cursorRef.current =
            noticesData.length > 0 ? noticesData[noticesData.length - 1] : null;
          setHasMore(noticesData.length === NOTICES_PER_PAGE);
          setLoading(false);
          setError(null);
        },
        onError: (err: Error) => {
          if (!isMountedRef.current) {return;}
          console.error('공지사항 로드 실패:', err);
          setError(err.message);
          setLoading(false);
        },
      }
    );

    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [noticeRepository, selectedCategory]);

  const {
    markAllAsRead,
    markAsRead,
    readStatus,
    readStatusLoading,
    refreshReadStatus,
    unreadCount,
    userJoinedAt,
    userJoinedAtLoaded,
  } = useNoticeReadState({ notices });

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) {return;}

    setLoadingMore(true);

    try {
      const catKey = selectedCategory || '전체';
      const result = await noticeRepository.getMoreNotices(
        catKey,
        cursorRef.current,
        NOTICES_PER_PAGE
      );

      if (!isMountedRef.current) {return;}

      if (result.data.length === 0) {
        setHasMore(false);
        setCategoryCache((prev) => ({
          ...prev,
          [catKey]: { ...prev[catKey], hasMore: false },
        }));
        return;
      }

      setNotices((prev) => {
        const merged = [...prev, ...result.data];
        setCategoryCache((prevCache) => ({
          ...prevCache,
          [catKey]: {
            items: merged,
            cursor: result.cursor,
            hasMore: result.hasMore,
            initialized: true,
          },
        }));
        return merged;
      });

      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('더 많은 공지사항 로드 실패:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, noticeRepository, selectedCategory]);

  return {
    notices,
    loading,
    loadingMore,
    error,
    hasMore,
    unreadCount,
    readStatus,
    readStatusLoading,
    markAsRead,
    markAllAsRead,
    loadMore,
    refreshReadStatus,
    userJoinedAt,
    userJoinedAtLoaded,
  };
}
