import { useCallback, useRef, useState } from 'react';

import type { PaginatedResult } from '@/repositories/interfaces/IChatRepository';

export interface PaginationState<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
}

export interface PaginationActions {
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export type InitialLoadFn<T> = () => Promise<PaginatedResult<T>>;
export type LoadMoreFn<T> = (cursor: unknown) => Promise<PaginatedResult<T>>;

export interface UsePaginationOptions<T> {
  initialLoad: InitialLoadFn<T>;
  loadMore: LoadMoreFn<T>;
  getId?: (item: T) => string;
  autoLoad?: boolean;
}

export function usePagination<T extends { id?: string }>(
  options: UsePaginationOptions<T>,
): PaginationState<T> & PaginationActions {
  const {
    initialLoad,
    loadMore: loadMoreFn,
    getId = (item: T) => item.id || '',
    autoLoad = true,
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const cursorRef = useRef<unknown>(null);
  const isInitialLoadDoneRef = useRef<boolean>(false);

  const doInitialLoad = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await initialLoad();

      setItems(result.data);
      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
      isInitialLoadDoneRef.current = true;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [initialLoad]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) {
      return;
    }

    try {
      setLoadingMore(true);

      const result = await loadMoreFn(cursorRef.current);

      setItems(prev => {
        const existingIds = new Set(prev.map(getId));
        const uniqueNewItems = result.data.filter(item => !existingIds.has(getId(item)));
        return [...prev, ...uniqueNewItems];
      });

      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoadingMore(false);
    }
  }, [getId, hasMore, loadMoreFn, loadingMore]);

  const refresh = useCallback(async () => {
    cursorRef.current = null;
    setHasMore(true);
    await doInitialLoad();
  }, [doInitialLoad]);

  const reset = useCallback(() => {
    setItems([]);
    setLoading(false);
    setLoadingMore(false);
    setError(null);
    setHasMore(true);
    cursorRef.current = null;
    isInitialLoadDoneRef.current = false;
  }, []);

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    reset,
  };
}

export interface RealtimePaginationState<T> extends PaginationState<T> {
  prependItems: (newItems: T[]) => void;
}

export function useRealtimePagination<T extends { id?: string }>(
  options: UsePaginationOptions<T>,
): RealtimePaginationState<T> & PaginationActions {
  const baseState = usePagination(options);

  const prependItems = useCallback((_items: T[]) => {
    console.debug('prependItems called, but not implemented');
  }, []);

  return {
    ...baseState,
    prependItems,
  };
}
