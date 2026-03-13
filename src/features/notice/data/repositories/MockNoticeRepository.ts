import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

import type {
  Comment,
  CommentFormData,
  INoticeRepository,
  Notice,
  NoticeCommentTreeNode,
  NoticeListPage,
  ReadStatusMap,
} from './INoticeRepository';

export class MockNoticeRepository implements INoticeRepository {
  private notices: Map<string, Notice> = new Map();
  private readStatus: Map<string, Set<string>> = new Map();
  private likes: Map<string, Set<string>> = new Map();
  private comments: Map<string, Comment[]> = new Map();

  constructor() {
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
      source: 'notice',
      contentDetail: '자세한 내용입니다.',
      contentAttachments: [],
      likeCount: 5,
      commentCount: 2,
      viewCount: 100,
    });
  }

  async getRecentNotices(limit: number): Promise<Notice[]> {
    return this.getOrderedNotices('전체').slice(0, limit);
  }

  subscribeToNotices(
    category: string,
    limit: number,
    callbacks: SubscriptionCallbacks<NoticeListPage>,
  ): Unsubscribe {
    const page = this.getNoticePage(category, null, limit);
    setTimeout(() => callbacks.onData(page), 10);
    return () => {};
  }

  async getMoreNotices(
    category: string,
    cursor: unknown,
    limit: number,
  ): Promise<NoticeListPage> {
    return this.getNoticePage(category, cursor, limit);
  }

  async getNotice(noticeId: string): Promise<Notice | null> {
    return this.notices.get(noticeId) || null;
  }

  subscribeToNotice(
    noticeId: string,
    callbacks: SubscriptionCallbacks<Notice | null>,
  ): Unsubscribe {
    const notice = this.notices.get(noticeId) || null;
    setTimeout(() => callbacks.onData(notice), 10);
    return () => {};
  }

  async getReadStatus(userId: string, noticeIds: string[]): Promise<ReadStatusMap> {
    const result: ReadStatusMap = {};
    noticeIds.forEach((noticeId) => {
      result[noticeId] = this.readStatus.get(noticeId)?.has(userId) || false;
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
    for (const noticeId of noticeIds) {
      await this.markAsRead(userId, noticeId);
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
    }

    noticeLikes.add(userId);
    if (notice) {
      notice.likeCount = (notice.likeCount || 0) + 1;
    }
    return true;
  }

  async isLiked(noticeId: string, userId: string): Promise<boolean> {
    return this.likes.get(noticeId)?.has(userId) || false;
  }

  async getComments(noticeId: string): Promise<NoticeCommentTreeNode[]> {
    const comments = this.comments.get(noticeId) || [];
    return comments.map((comment) => ({ ...comment, replies: [] }));
  }

  subscribeToComments(
    noticeId: string,
    callbacks: SubscriptionCallbacks<NoticeCommentTreeNode[]>,
  ): Unsubscribe {
    this.getComments(noticeId).then((comments) => {
      callbacks.onData(comments);
    });
    return () => {};
  }

  async createComment(
    noticeId: string,
    comment: CommentFormData & { userId: string; userDisplayName: string },
  ): Promise<string> {
    const id = `comment-${Date.now()}`;
    const now = new Date();
    const newComment: Comment = {
      id,
      noticeId,
      userId: comment.userId,
      userDisplayName: comment.userDisplayName,
      content: comment.content,
      isAnonymous: comment.isAnonymous || false,
      parentId: comment.parentId,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      replies: [],
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
    const updated = comments.map((comment) =>
      comment.id === commentId
        ? { ...comment, content, updatedAt: new Date() }
        : comment,
    );
    this.comments.set(noticeId, updated);
  }

  async deleteComment(noticeId: string, commentId: string): Promise<void> {
    const comments = this.comments.get(noticeId) || [];
    const updated = comments.map((comment) =>
      comment.id === commentId ? { ...comment, isDeleted: true } : comment,
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

  addMockNotice(notice: Notice): void {
    this.notices.set(notice.id, notice);
  }

  clearMockData(): void {
    this.notices.clear();
    this.readStatus.clear();
    this.likes.clear();
    this.comments.clear();
  }

  private getOrderedNotices(category: string): Notice[] {
    const notices = Array.from(this.notices.values());

    return notices
      .filter((notice) => category === '전체' || notice.category === category)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private getCursor(notices: Notice[]): string | null {
    return notices.length > 0 ? notices[notices.length - 1].id : null;
  }

  private getNoticePage(
    category: string,
    cursor: unknown,
    limit: number,
  ): NoticeListPage {
    const notices = this.getOrderedNotices(category);
    const cursorId = typeof cursor === 'string' ? cursor : null;
    const startIndex = cursorId
      ? notices.findIndex((notice) => notice.id === cursorId) + 1
      : 0;

    if (cursorId && startIndex === 0) {
      return { data: [], hasMore: false, cursor: null };
    }

    const page = notices.slice(startIndex, startIndex + limit);

    return {
      data: page,
      hasMore: notices.length > startIndex + page.length,
      cursor: this.getCursor(page),
    };
  }
}
