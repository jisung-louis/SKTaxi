// SKTaxi: Board Repository 인터페이스 - DIP 원칙 적용
// 게시판 게시물 및 댓글 관련 데이터 접근 추상화

import { BoardPost, BoardComment, BoardImage } from '../../types/board';
import { Unsubscribe, SubscriptionCallbacks } from './IPartyRepository';
import { PaginatedResult } from './IChatRepository';

/**
 * 게시물 정렬 옵션
 */
export type BoardSortOption = 'latest' | 'popular' | 'mostCommented' | 'mostViewed';

/**
 * 게시물 필터 옵션
 */
export interface BoardFilterOptions {
  category?: string;
  authorId?: string;
  searchText?: string;
  sortBy?: BoardSortOption;
}

/**
 * 댓글 트리 노드 (대댓글 포함)
 */
export interface CommentTreeNode extends BoardComment {
  replies: CommentTreeNode[];
}

/**
 * Board Repository 인터페이스
 */
export interface IBoardRepository {
  // === 게시물 관련 ===

  /**
   * 게시물 목록 초기 로드
   * @param filters - 필터 옵션
   * @param limit - 가져올 게시물 수
   * @returns 페이지네이션 결과
   */
  getPosts(filters: BoardFilterOptions, limit: number): Promise<PaginatedResult<BoardPost>>;

  /**
   * 더 많은 게시물 로드 (페이지네이션)
   * @param filters - 필터 옵션
   * @param cursor - 이전 조회의 커서
   * @param limit - 가져올 게시물 수
   * @returns 페이지네이션 결과
   */
  getMorePosts(filters: BoardFilterOptions, cursor: unknown, limit: number): Promise<PaginatedResult<BoardPost>>;

  /**
   * 게시물 목록 실시간 구독 (새 게시물 감지용)
   * @param filters - 필터 옵션
   * @param limit - 초기 로드 수
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToPosts(
    filters: BoardFilterOptions,
    limit: number,
    callbacks: SubscriptionCallbacks<BoardPost[]>
  ): Unsubscribe;

  /**
   * 단일 게시물 조회
   * @param postId - 게시물 ID
   * @returns 게시물 또는 null
   */
  getPost(postId: string): Promise<BoardPost | null>;

  /**
   * 단일 게시물 실시간 구독
   * @param postId - 게시물 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToPost(postId: string, callbacks: SubscriptionCallbacks<BoardPost | null>): Unsubscribe;

  /**
   * 게시물 생성
   * @param post - 게시물 데이터
   * @returns 생성된 게시물 ID
   */
  createPost(post: Omit<BoardPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount' | 'bookmarkCount'>): Promise<string>;

  /**
   * 게시물 수정
   * @param postId - 게시물 ID
   * @param updates - 업데이트할 필드
   */
  updatePost(postId: string, updates: Partial<BoardPost>): Promise<void>;

  /**
   * 게시물 삭제 (소프트 삭제)
   * @param postId - 게시물 ID
   */
  deletePost(postId: string): Promise<void>;

  /**
   * 게시물 좋아요 토글
   * @param postId - 게시물 ID
   * @param userId - 사용자 ID
   * @returns 좋아요 상태 (true: 좋아요 추가됨, false: 좋아요 취소됨)
   */
  toggleLike(postId: string, userId: string): Promise<boolean>;

  /**
   * 게시물 좋아요 여부 확인
   * @param postId - 게시물 ID
   * @param userId - 사용자 ID
   * @returns 좋아요 여부
   */
  isLiked(postId: string, userId: string): Promise<boolean>;

  /**
   * 게시물 북마크 토글
   * @param postId - 게시물 ID
   * @param userId - 사용자 ID
   * @returns 북마크 상태 (true: 북마크 추가됨, false: 북마크 취소됨)
   */
  toggleBookmark(postId: string, userId: string): Promise<boolean>;

  /**
   * 게시물 북마크 여부 확인
   * @param postId - 게시물 ID
   * @param userId - 사용자 ID
   * @returns 북마크 여부
   */
  isBookmarked(postId: string, userId: string): Promise<boolean>;

  /**
   * 조회수 증가
   * @param postId - 게시물 ID
   */
  incrementViewCount(postId: string): Promise<void>;

  // === 댓글 관련 ===

  /**
   * 댓글 목록 조회 (트리 구조)
   * @param postId - 게시물 ID
   * @returns 댓글 트리
   */
  getComments(postId: string): Promise<CommentTreeNode[]>;

  /**
   * 댓글 목록 실시간 구독
   * @param postId - 게시물 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToComments(postId: string, callbacks: SubscriptionCallbacks<CommentTreeNode[]>): Unsubscribe;

  /**
   * 댓글 작성
   * @param postId - 게시물 ID
   * @param comment - 댓글 데이터
   * @returns 생성된 댓글 ID
   */
  createComment(postId: string, comment: Omit<BoardComment, 'id' | 'postId' | 'createdAt' | 'updatedAt'>): Promise<string>;

  /**
   * 댓글 수정
   * @param postId - 게시물 ID
   * @param commentId - 댓글 ID
   * @param content - 새 내용
   */
  updateComment(postId: string, commentId: string, content: string): Promise<void>;

  /**
   * 댓글 삭제 (소프트 삭제)
   * @param postId - 게시물 ID
   * @param commentId - 댓글 ID
   */
  deleteComment(postId: string, commentId: string): Promise<void>;

  // === 이미지 관련 ===

  /**
   * 이미지 업로드
   * @param uri - 로컬 이미지 URI
   * @param postId - 게시물 ID (선택)
   * @returns 업로드된 이미지 정보
   */
  uploadImage(uri: string, postId?: string): Promise<BoardImage>;

  /**
   * 이미지 삭제
   * @param imageUrl - 삭제할 이미지 URL
   */
  deleteImage(imageUrl: string): Promise<void>;

  // === 통계 관련 ===

  /**
   * 카테고리별 게시물 수 조회
   * @param categories - 조회할 카테고리 ID 배열
   * @returns 카테고리 ID를 키로, 게시물 수를 값으로 하는 맵 (key 'all'은 전체 수)
   */
  getCategoryCounts(categories: string[]): Promise<Record<string, number>>;
}
