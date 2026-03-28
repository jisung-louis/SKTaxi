import React from 'react';

import type {Notice} from '../model/types';
import {useNoticeReadState} from './useNoticeReadState';
import {useNoticeRepository} from './useNoticeRepository';

const NOTICE_SEARCH_PAGE_SIZE = 20;

const normalizeQuery = (value: string) => value.trim();

export const useNoticeSearchData = (query: string) => {
  const noticeRepository = useNoticeRepository();
  const normalizedQuery = React.useMemo(() => normalizeQuery(query), [query]);
  const [items, setItems] = React.useState<Notice[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(false);
  const [totalCount, setTotalCount] = React.useState(0);
  const cursorRef = React.useRef<unknown>(null);
  const requestIdRef = React.useRef(0);
  const hasMoreRef = React.useRef(false);
  const loadingRef = React.useRef(false);
  const loadingMoreRef = React.useRef(false);
  const {markAsRead, readStatus, userJoinedAt, userJoinedAtLoaded} =
    useNoticeReadState({
      notices: items,
    });

  React.useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  React.useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  React.useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  const fetchInitial = React.useCallback(async () => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (!normalizedQuery) {
      cursorRef.current = null;
      hasMoreRef.current = false;
      loadingRef.current = false;
      loadingMoreRef.current = false;
      setItems([]);
      setLoading(false);
      setLoadingMore(false);
      setError(null);
      setHasMore(false);
      setTotalCount(0);
      return;
    }

    cursorRef.current = null;
    hasMoreRef.current = false;
    loadingRef.current = true;
    loadingMoreRef.current = false;
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setHasMore(false);

    try {
      const page = await noticeRepository.searchNotices(
        normalizedQuery,
        null,
        NOTICE_SEARCH_PAGE_SIZE,
      );

      if (requestId !== requestIdRef.current) {
        return;
      }

      cursorRef.current = page.cursor;
      hasMoreRef.current = page.hasMore;
      setHasMore(page.hasMore);
      setTotalCount(page.totalElements ?? page.data.length);
      setError(null);
      setItems(page.data);
    } catch (nextError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      hasMoreRef.current = false;
      setError(
        nextError instanceof Error
          ? nextError.message
          : '검색 결과를 불러오지 못했습니다.',
      );
      setItems([]);
      setHasMore(false);
      setTotalCount(0);
    } finally {
      if (requestId !== requestIdRef.current) {
        return;
      }

      loadingRef.current = false;
      setLoading(false);
    }
  }, [normalizedQuery, noticeRepository]);

  React.useEffect(() => {
    fetchInitial().catch(() => undefined);
  }, [fetchInitial]);

  const loadMore = React.useCallback(async () => {
    if (
      !normalizedQuery ||
      loadingRef.current ||
      loadingMoreRef.current ||
      !hasMoreRef.current ||
      !cursorRef.current
    ) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const page = await noticeRepository.searchNotices(
        normalizedQuery,
        cursorRef.current,
        NOTICE_SEARCH_PAGE_SIZE,
      );

      if (requestId !== requestIdRef.current) {
        return;
      }

      cursorRef.current = page.cursor;
      hasMoreRef.current = page.hasMore;
      setHasMore(page.hasMore);
      setTotalCount(page.totalElements ?? page.data.length);
      setError(null);
      setItems(previousItems => [...previousItems, ...page.data]);
    } catch (nextError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(
        nextError instanceof Error
          ? nextError.message
          : '검색 결과를 불러오지 못했습니다.',
      );
    } finally {
      if (requestId !== requestIdRef.current) {
        return;
      }

      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [normalizedQuery, noticeRepository]);

  const retry = React.useCallback(async () => {
    await fetchInitial();
  }, [fetchInitial]);

  return {
    error,
    hasMore,
    items,
    loadMore,
    loading,
    loadingMore,
    markAsRead,
    readStatus,
    retry,
    totalCount,
    userJoinedAt,
    userJoinedAtLoaded,
  };
};
