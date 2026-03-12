import type { PaginatedResult } from '@/shared/types/pagination';
import type { SubscriptionCallbacks, Unsubscribe } from '@/features/taxi';

import type {
  CommentFormData,
  Notice,
  NoticeCommentTreeNode,
  NoticeFilterOptions,
  ReadStatusMap,
} from '../../model/types';

export interface INoticeRepository {
  getRecentNotices(limit: number): Promise<Notice[]>;
  subscribeToNotices(
    category: string,
    limit: number,
    callbacks: SubscriptionCallbacks<Notice[]>,
  ): Unsubscribe;
  getMoreNotices(
    category: string,
    cursor: unknown,
    limit: number,
  ): Promise<PaginatedResult<Notice>>;
  getNotice(noticeId: string): Promise<Notice | null>;
  subscribeToNotice(
    noticeId: string,
    callbacks: SubscriptionCallbacks<Notice | null>,
  ): Unsubscribe;
  getReadStatus(userId: string, noticeIds: string[]): Promise<ReadStatusMap>;
  markAsRead(userId: string, noticeId: string): Promise<void>;
  markAllAsRead(userId: string, noticeIds: string[]): Promise<void>;
  toggleLike(noticeId: string, userId: string): Promise<boolean>;
  isLiked(noticeId: string, userId: string): Promise<boolean>;
  getComments(noticeId: string): Promise<NoticeCommentTreeNode[]>;
  subscribeToComments(
    noticeId: string,
    callbacks: SubscriptionCallbacks<NoticeCommentTreeNode[]>,
  ): Unsubscribe;
  createComment(
    noticeId: string,
    comment: CommentFormData & { userId: string; userDisplayName: string },
  ): Promise<string>;
  updateComment(noticeId: string, commentId: string, content: string): Promise<void>;
  deleteComment(noticeId: string, commentId: string): Promise<void>;
  incrementViewCount(noticeId: string): Promise<void>;
}

export type {
  CommentFormData,
  Notice,
  NoticeCommentTreeNode,
  NoticeFilterOptions,
  ReadStatusMap,
};
