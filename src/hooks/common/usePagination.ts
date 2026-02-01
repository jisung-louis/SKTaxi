// SKTaxi: 페이지네이션을 위한 공통 훅
// Firestore cursor 기반 페이지네이션 로직 추상화

import { useState, useCallback, useRef } from 'react';
import { PaginatedResult } from '../../repositories/interfaces/IChatRepository';

/**
 * 페이지네이션 상태 타입
 */
export interface PaginationState<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
}

/**
 * 페이지네이션 액션 타입
 */
export interface PaginationActions {
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * 초기 로드 함수 타입
 */
export type InitialLoadFn<T> = () => Promise<PaginatedResult<T>>;

/**
 * 더 로드 함수 타입
 */
export type LoadMoreFn<T> = (cursor: unknown) => Promise<PaginatedResult<T>>;

/**
 * 페이지네이션 옵션
 */
export interface UsePaginationOptions<T> {
  initialLoad: InitialLoadFn<T>;
  loadMore: LoadMoreFn<T>;
  /**
   * 중복 제거를 위한 ID 추출 함수
   * 기본값: item.id
   */
  getId?: (item: T) => string;
  /**
   * 자동 초기 로드 여부
   * 기본값: true
   */
  autoLoad?: boolean;
}

/**
 * Firestore cursor 기반 페이지네이션 훅
 *
 * @example
 * const { items, loading, loadingMore, hasMore, loadMore, refresh } = usePagination({
 *   initialLoad: () => boardRepository.getPosts(filters, 20),
 *   loadMore: (cursor) => boardRepository.getMorePosts(filters, cursor, 20),
 *   getId: (post) => post.id,
 * });
 */
export function usePagination<T extends { id?: string }>(
  options: UsePaginationOptions<T>
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

  // 커서를 ref로 관리 (상태 변경 없이 유지)
  const cursorRef = useRef<unknown>(null);
  // 초기 로드 완료 여부
  const isInitialLoadDoneRef = useRef<boolean>(false);

  /**
   * 초기 데이터 로드
   */
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

  /**
   * 더 많은 데이터 로드
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) {
      return;
    }

    try {
      setLoadingMore(true);

      const result = await loadMoreFn(cursorRef.current);

      setItems((prev) => {
        // 중복 제거
        const existingIds = new Set(prev.map(getId));
        const uniqueNewItems = result.data.filter(
          (item) => !existingIds.has(getId(item))
        );
        return [...prev, ...uniqueNewItems];
      });

      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loadMoreFn, getId]);

  /**
   * 데이터 새로고침 (처음부터 다시 로드)
   */
  const refresh = useCallback(async () => {
    cursorRef.current = null;
    setHasMore(true);
    await doInitialLoad();
  }, [doInitialLoad]);

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setItems([]);
    setLoading(false);
    setLoadingMore(false);
    setError(null);
    setHasMore(true);
    cursorRef.current = null;
    isInitialLoadDoneRef.current = false;
  }, []);

  // 자동 초기 로드
  // 주의: 이 훅을 사용하는 컴포넌트는 필요한 경우 useEffect에서 refresh()를 호출해야 함
  // 여기서는 자동 로드를 하지 않음 (조건부 로드를 위해)

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

/**
 * 실시간 구독과 페이지네이션을 결합한 훅
 * 채팅 메시지 같은 케이스에서 사용
 *
 * - 초기 로드: 최신 N개
 * - 실시간 구독: 새 메시지 수신
 * - 페이지네이션: 이전 메시지 로드
 */
export interface RealtimePaginationState<T> extends PaginationState<T> {
  /**
   * 배열 앞에 새 아이템 추가 (실시간 수신용)
   */
  prependItems: (newItems: T[]) => void;
}

export function useRealtimePagination<T extends { id?: string }>(
  options: UsePaginationOptions<T>
): RealtimePaginationState<T> & PaginationActions {
  const baseState = usePagination(options);

  /**
   * 새 아이템을 배열 앞에 추가 (실시간 메시지 수신용)
   * 참고: 실제 사용 시에는 useChatMessages처럼 커스텀 구현 권장
   */
  const prependItems = useCallback(
    (_items: T[]) => {
      // items를 직접 수정할 수 없으므로 별도 상태 관리 필요
      // 이 구현은 usePagination의 setItems에 접근할 수 없어 제한적
      // 향후 options.getId를 사용하여 중복 제거 로직 추가 예정
      console.debug('prependItems called, but not implemented');
    },
    []
  );

  return {
    ...baseState,
    prependItems,
  };
}
