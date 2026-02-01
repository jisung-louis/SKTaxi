// SKTaxi: Notice Repository 인터페이스 - DIP 원칙 적용
// 공지사항 관련 데이터 접근 추상화

import { Unsubscribe, SubscriptionCallbacks } from './IPartyRepository';
import { PaginatedResult } from './IChatRepository';
import { Comment, CommentFormData } from '../../types/comment';

/**
 * 공지사항 타입
 */
export interface Notice {
  id: string;
  title: string;
  content: string;
  link: string;
  /** Firebase Timestamp - 런타임에 toDate() 메서드 제공 */
  postedAt: any;
  category: string;
  createdAt: string;
  author: string;
  department: string;
  source: string;
  contentDetail: string;
  contentAttachments: { name: string; downloadUrl: string; previewUrl: string }[];
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
}

/**
 * 공지사항 읽음 상태 맵
 */
export type ReadStatusMap = Record<string, boolean>;

/**
 * 공지사항 필터 옵션
 */
export interface NoticeFilterOptions {
  category?: string;
}

/**
 * 공지 댓글 트리 노드 (대댓글 포함)
 * IBoardRepository의 CommentTreeNode와 구분하기 위해 별도 타입으로 정의
 */
export interface NoticeCommentTreeNode extends Comment {
  replies: NoticeCommentTreeNode[];
}

/**
 * Notice Repository 인터페이스
 */
export interface INoticeRepository {
  // === 공지사항 관련 ===

  /**
   * 최근 공지사항 목록 조회 (구독 없이 단발 조회)
   * @param limit - 가져올 공지 수
   * @returns 공지사항 배열
   */
  getRecentNotices(limit: number): Promise<Notice[]>;

  /**
   * 공지사항 목록 실시간 구독
   * @param category - 카테고리 필터 ('전체' 또는 특정 카테고리)
   * @param limit - 가져올 공지 수
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToNotices(
    category: string,
    limit: number,
    callbacks: SubscriptionCallbacks<Notice[]>
  ): Unsubscribe;

  /**
   * 더 많은 공지사항 로드 (페이지네이션)
   * @param category - 카테고리 필터
   * @param cursor - 이전 조회의 커서
   * @param limit - 가져올 공지 수
   * @returns 페이지네이션 결과
   */
  getMoreNotices(category: string, cursor: unknown, limit: number): Promise<PaginatedResult<Notice>>;

  /**
   * 단일 공지사항 조회
   * @param noticeId - 공지 ID
   * @returns 공지사항 또는 null
   */
  getNotice(noticeId: string): Promise<Notice | null>;

  /**
   * 단일 공지사항 실시간 구독
   * @param noticeId - 공지 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToNotice(noticeId: string, callbacks: SubscriptionCallbacks<Notice | null>): Unsubscribe;

  // === 읽음 상태 관련 ===

  /**
   * 여러 공지의 읽음 상태 조회
   * @param userId - 사용자 ID
   * @param noticeIds - 공지 ID 배열
   * @returns 공지 ID별 읽음 상태 맵
   */
  getReadStatus(userId: string, noticeIds: string[]): Promise<ReadStatusMap>;

  /**
   * 공지 읽음 처리
   * @param userId - 사용자 ID
   * @param noticeId - 공지 ID
   */
  markAsRead(userId: string, noticeId: string): Promise<void>;

  /**
   * 여러 공지 일괄 읽음 처리
   * @param userId - 사용자 ID
   * @param noticeIds - 공지 ID 배열
   */
  markAllAsRead(userId: string, noticeIds: string[]): Promise<void>;

  // === 좋아요 관련 ===

  /**
   * 공지 좋아요 토글
   * @param noticeId - 공지 ID
   * @param userId - 사용자 ID
   * @returns 좋아요 상태 (true: 추가됨, false: 취소됨)
   */
  toggleLike(noticeId: string, userId: string): Promise<boolean>;

  /**
   * 공지 좋아요 여부 확인
   * @param noticeId - 공지 ID
   * @param userId - 사용자 ID
   * @returns 좋아요 여부
   */
  isLiked(noticeId: string, userId: string): Promise<boolean>;

  // === 댓글 관련 ===

  /**
   * 댓글 목록 조회 (트리 구조)
   * @param noticeId - 공지 ID
   * @returns 댓글 트리
   */
  getComments(noticeId: string): Promise<NoticeCommentTreeNode[]>;

  /**
   * 댓글 목록 실시간 구독
   * @param noticeId - 공지 ID
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToComments(noticeId: string, callbacks: SubscriptionCallbacks<NoticeCommentTreeNode[]>): Unsubscribe;

  /**
   * 댓글 작성
   * @param noticeId - 공지 ID
   * @param comment - 댓글 데이터
   * @returns 생성된 댓글 ID
   */
  createComment(noticeId: string, comment: CommentFormData & { userId: string; userDisplayName: string }): Promise<string>;

  /**
   * 댓글 수정
   * @param noticeId - 공지 ID
   * @param commentId - 댓글 ID
   * @param content - 새 내용
   */
  updateComment(noticeId: string, commentId: string, content: string): Promise<void>;

  /**
   * 댓글 삭제 (소프트 삭제)
   * @param noticeId - 공지 ID
   * @param commentId - 댓글 ID
   */
  deleteComment(noticeId: string, commentId: string): Promise<void>;

  // === 조회수 관련 ===

  /**
   * 공지 조회수를 증가시킵니다
   * @param noticeId - 공지 ID
   */
  incrementViewCount(noticeId: string): Promise<void>;
}
