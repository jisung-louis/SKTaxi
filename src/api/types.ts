// SKTaxi: API 공통 타입 정의

/**
 * 실시간 구독 해제 함수 타입
 * Repository와 Hook에서 공통 사용
 */
export type Unsubscribe = () => void;

/**
 * 실시간 구독 콜백 타입
 * Repository와 Hook에서 공통 사용
 */
export interface SubscriptionCallbacks<T> {
  onData: (data: T) => void;
  onError: (error: Error) => void;
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  cursor?: string;
}

/**
 * 페이지네이션 결과
 */
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount?: number;
}

/**
 * 정렬 옵션
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * 필터 옵션 (제네릭)
 */
export type FilterOptions<T> = Partial<T>;

/**
 * 배치 작업 결과
 */
export interface BatchResult {
  success: number;
  failed: number;
  errors?: Array<{ index: number; error: string }>;
}
