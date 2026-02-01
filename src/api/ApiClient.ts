// SKTaxi: API Client 추상화 - Spring 마이그레이션을 위한 기반
// 현재는 인터페이스만 정의, 추후 Spring 백엔드 연동 시 구현체 추가

/**
 * HTTP API 클라이언트 인터페이스
 * Spring 백엔드 마이그레이션 시 이 인터페이스를 구현한 클라이언트 사용
 */
export interface ApiClient {
  /**
   * GET 요청
   * @param endpoint - API 엔드포인트 (예: '/api/parties')
   * @param params - 쿼리 파라미터
   * @returns 응답 데이터
   */
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;

  /**
   * POST 요청
   * @param endpoint - API 엔드포인트
   * @param data - 요청 바디
   * @returns 응답 데이터
   */
  post<T>(endpoint: string, data: Record<string, any>): Promise<T>;

  /**
   * PUT 요청
   * @param endpoint - API 엔드포인트
   * @param data - 요청 바디
   * @returns 응답 데이터
   */
  put<T>(endpoint: string, data: Record<string, any>): Promise<T>;

  /**
   * PATCH 요청
   * @param endpoint - API 엔드포인트
   * @param data - 부분 업데이트 데이터
   * @returns 응답 데이터
   */
  patch<T>(endpoint: string, data: Record<string, any>): Promise<T>;

  /**
   * DELETE 요청
   * @param endpoint - API 엔드포인트
   */
  delete(endpoint: string): Promise<void>;
}

/**
 * 실시간 구독 클라이언트 인터페이스
 * Spring 백엔드의 WebSocket/SSE 연동 시 이 인터페이스 구현
 */
export interface RealtimeClient {
  /**
   * 실시간 구독 시작
   * @param channel - 구독 채널 (예: '/ws/parties', '/sse/notifications')
   * @param callback - 데이터 수신 콜백
   * @returns 구독 해제 함수
   */
  subscribe<T>(channel: string, callback: (data: T) => void): () => void;

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean;

  /**
   * 연결 종료
   */
  disconnect(): void;
}

/**
 * API 응답 래퍼 타입
 * Spring 백엔드의 표준 응답 형식
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  timestamp: string;
}

/**
 * API 에러 응답 타입
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}
