// SKTaxi: Notice Repository Mock 구현체
// 테스트 및 개발용 Mock 데이터 제공

import { Comment, CommentFormData } from '../../types/comment';
import {
  INoticeRepository,
  Notice,
  ReadStatusMap,
  NoticeCommentTreeNode,
} from '../interfaces/INoticeRepository';
import { PaginatedResult } from '../interfaces/IChatRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../interfaces/IPartyRepository';

/**
 * Mock Notice Repository 구현체
 */
export class MockNoticeRepository implements INoticeRepository {
  private notices: Map<string, Notice> = new Map();
  private readStatus: Map<string, Set<string>> = new Map(); // noticeId -> Set<userId>
  private likes: Map<string, Set<string>> = new Map(); // noticeId -> Set<userId>
  private comments: Map<string, Comment[]> = new Map();

  constructor() {
    // 기본 테스트 공지사항 추가
    const now = new Date();
    this.notices.set('notice1', {
      id: 'notice1',
      title: '서비스 오픈 안내',
      content: 'SKURI Taxi 서비스가 오픈되었습니다.',
      link: '',
      postedAt: now,
      category: '일반',
      createdAt: now.toISOString(),
      author: '관리자',
      department: '운영팀',
      source: 'app',
      contentDetail: '자세한 내용입니다.',
      contentAttachments: [],
      likeCount: 5,
      commentCount: 2,
      viewCount: 100,
    });
  }

  async getRecentNotices(limit: number): Promise<Notice[]> {
    return Array.from(this.notices.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  subscribeToNotices(
    category: string,
    limit: number,
    callbacks: SubscriptionCallbacks<Notice[]>
  ): Unsubscribe {
    let notices = Array.from(this.notices.values());
    if (category !== '전체') {
      notices = notices.filter(n => n.category === category);
    }
    notices = notices.slice(0, limit);
    setTimeout(() => callbacks.onData(notices), 10);
    return () => {};
  }

  async getMoreNotices(
    category: string,
    cursor: unknown,
    limit: number
  ): Promise<PaginatedResult<Notice>> {
    let notices = Array.from(this.notices.values());
    if (category !== '전체') {
      notices = notices.filter(n => n.category === category);
    }
    return {
      data: notices.slice(0, limit),
      hasMore: notices.length > limit,
      cursor: null,
    };
  }

  async getNotice(noticeId: string): Promise<Notice | null> {
    return this.notices.get(noticeId) || null;
  }

  subscribeToNotice(
    noticeId: string,
    callbacks: SubscriptionCallbacks<Notice | null>
  ): Unsubscribe {
    const notice = this.notices.get(noticeId) || null;
    setTimeout(() => callbacks.onData(notice), 10);
    return () => {};
  }

  async getReadStatus(userId: string, noticeIds: string[]): Promise<ReadStatusMap> {
    const result: ReadStatusMap = {};
    noticeIds.forEach(id => {
      result[id] = this.readStatus.get(id)?.has(userId) || false;
    });
    return result;
  }

  async markAsRead(userId: string, noticeId: string): Promise<void> {
    if (!this.readStatus.has(noticeId)) {
      this.readStatus.set(noticeId, new Set());
    }
    this.readStatus.get(noticeId)!.add(userId);
  }

  async markAllAsRead(userId: string, noticeIds: string[]): Promise<void> {
    for (const id of noticeIds) {
      await this.markAsRead(userId, id);
    }
  }

  async toggleLike(noticeId: string, userId: string): Promise<boolean> {
    if (!this.likes.has(noticeId)) {
      this.likes.set(noticeId, new Set());
    }
    const noticeLikes = this.likes.get(noticeId)!;
    const notice = this.notices.get(noticeId);

    if (noticeLikes.has(userId)) {
      noticeLikes.delete(userId);
      if (notice) {
        notice.likeCount = Math.max(0, (notice.likeCount || 0) - 1);
      }
      return false;
    } else {
      noticeLikes.add(userId);
      if (notice) {
        notice.likeCount = (notice.likeCount || 0) + 1;
      }
      return true;
    }
  }

  async isLiked(noticeId: string, userId: string): Promise<boolean> {
    return this.likes.get(noticeId)?.has(userId) || false;
  }

  async getComments(noticeId: string): Promise<NoticeCommentTreeNode[]> {
    const comments = this.comments.get(noticeId) || [];
    return comments.map(c => ({ ...c, replies: [] }));
  }

  subscribeToComments(
    noticeId: string,
    callbacks: SubscriptionCallbacks<NoticeCommentTreeNode[]>
  ): Unsubscribe {
    this.getComments(noticeId).then(comments => {
      callbacks.onData(comments);
    });
    return () => {};
  }

  async createComment(
    noticeId: string,
    comment: CommentFormData & { userId: string; userDisplayName: string }
  ): Promise<string> {
    const id = `comment-${Date.now()}`;
    const now = new Date();
    const newComment: Comment = {
      id,
      postId: noticeId,
      authorId: comment.userId,
      authorDisplayName: comment.userDisplayName,
      content: comment.content,
      isAnonymous: comment.isAnonymous || false,
      parentId: comment.parentId,
      createdAt: now as any,
      updatedAt: now as any,
      isDeleted: false,
    };
    const comments = this.comments.get(noticeId) || [];
    this.comments.set(noticeId, [...comments, newComment]);

    const notice = this.notices.get(noticeId);
    if (notice) {
      notice.commentCount = (notice.commentCount || 0) + 1;
    }

    return id;
  }

  async updateComment(noticeId: string, commentId: string, content: string): Promise<void> {
    const comments = this.comments.get(noticeId) || [];
    const updated = comments.map(c =>
      c.id === commentId ? { ...c, content, updatedAt: new Date() as any } : c
    );
    this.comments.set(noticeId, updated);
  }

  async deleteComment(noticeId: string, commentId: string): Promise<void> {
    const comments = this.comments.get(noticeId) || [];
    const updated = comments.map(c =>
      c.id === commentId ? { ...c, isDeleted: true } : c
    );
    this.comments.set(noticeId, updated);

    const notice = this.notices.get(noticeId);
    if (notice) {
      notice.commentCount = Math.max(0, (notice.commentCount || 0) - 1);
    }
  }

  async incrementViewCount(noticeId: string): Promise<void> {
    const notice = this.notices.get(noticeId);
    if (notice) {
      notice.viewCount = (notice.viewCount || 0) + 1;
    }
  }

  // 테스트용 헬퍼 메서드
  addMockNotice(notice: Notice): void {
    this.notices.set(notice.id, notice);
  }

  clearMockData(): void {
    this.notices.clear();
    this.readStatus.clear();
    this.likes.clear();
    this.comments.clear();
  }
}
