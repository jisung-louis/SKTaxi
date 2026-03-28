import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

import {NOTICE_DETAIL_MOCK} from '../mocks/noticeDetail.mock';
import {NOTICE_HOME_ITEMS_MOCK} from '../mocks/noticeHome.mock';
import type {
  Comment,
  CommentFormData,
  INoticeRepository,
  Notice,
  NoticeCommentTreeNode,
  NoticeListPage,
  ReadStatusMap,
} from '../data/repositories/INoticeRepository';

type NoticeDetailParagraphBlock = Extract<
  (typeof NOTICE_DETAIL_MOCK)[number]['bodyBlocks'][number],
  {type: 'paragraph'}
>;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildContentDetail = (
  noticeId: string,
  bodyBlocks: (typeof NOTICE_DETAIL_MOCK)[number]['bodyBlocks'],
) =>
  bodyBlocks
    .map((block, index) => {
      if (block.type === 'image') {
        return `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(
          block.alt ?? `${noticeId}-image-${index + 1}`,
        )}" />`;
      }

      if (block.type === 'table') {
        return block.html;
      }

      return `<p>${escapeHtml(block.text).replace(/\n/g, '<br />')}</p>`;
    })
    .join('');

const buildSeedNotices = (): Notice[] =>
  NOTICE_DETAIL_MOCK.map(detail => {
    const firstParagraph = detail.bodyBlocks.find(
      (block): block is NoticeDetailParagraphBlock =>
        block.type === 'paragraph',
    );

    return {
      id: detail.id,
      title: detail.title,
      content: firstParagraph?.text ?? detail.title,
      link: '',
      postedAt: new Date(detail.postedAt),
      category: detail.category,
      createdAt: detail.postedAt,
      author: '성결대학교',
      department: '성결대학교',
      source: 'notice',
      contentDetail: buildContentDetail(detail.id, detail.bodyBlocks),
      contentAttachments: detail.attachments.map(attachment => ({
        name: attachment.fileName,
        downloadUrl: '',
        previewUrl: '',
      })),
      likeCount: detail.likeCount,
      commentCount: detail.comments.length,
      viewCount: 0,
    } satisfies Notice;
  });

const buildSeedComments = (): Map<string, Comment[]> =>
  new Map<string, Comment[]>(
    NOTICE_DETAIL_MOCK.filter(detail => detail.comments.length > 0).map(
      detail => [
        detail.id,
        detail.comments.map<Comment>(comment => ({
          id: comment.id,
          noticeId: detail.id,
          userId: `mock-${comment.authorName}`,
          userDisplayName: comment.authorName,
          content: comment.content,
          createdAt: new Date(comment.postedAt),
          updatedAt: new Date(comment.postedAt),
          isDeleted: false,
          isLiked: false,
          likeCount: 0,
          parentId: null,
          replies: [],
        })),
      ],
    ),
  );

const cloneComment = (comment: Comment): Comment => ({
  ...comment,
  createdAt: new Date(comment.createdAt),
  replies: comment.replies?.map(cloneComment) ?? [],
  updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined,
});

const buildCommentTree = (flatComments: Comment[]): NoticeCommentTreeNode[] => {
  const roots: NoticeCommentTreeNode[] = [];
  const nodeById = new Map<string, NoticeCommentTreeNode>();

  flatComments.forEach(comment => {
    nodeById.set(comment.id, {
      ...cloneComment(comment),
      replies: [],
    });
  });

  flatComments.forEach(comment => {
    const node = nodeById.get(comment.id);
    if (!node) {
      return;
    }

    if (comment.parentId) {
      nodeById.get(comment.parentId)?.replies.push(node);
      return;
    }

    roots.push(node);
  });

  return roots;
};

export class MockNoticeRepository implements INoticeRepository {
  private notices = new Map<string, Notice>();

  private readStatus = new Map<string, Set<string>>();

  private likes = new Map<string, Set<string>>();

  private commentLikes = new Map<string, Set<string>>();

  private bookmarks = new Map<string, Set<string>>();

  private comments = buildSeedComments();

  private readonly defaultReadNoticeIds = new Set(
    NOTICE_HOME_ITEMS_MOCK.filter(item => item.isRead).map(item => item.id),
  );

  constructor() {
    buildSeedNotices().forEach(notice => {
      this.notices.set(notice.id, notice);
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

  async searchNotices(
    search: string,
    cursor: unknown,
    limit: number,
  ): Promise<NoticeListPage> {
    return this.getNoticePage('전체', cursor, limit, search);
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

  async getReadStatus(
    userId: string,
    noticeIds: string[],
  ): Promise<ReadStatusMap> {
    const result: ReadStatusMap = {};
    noticeIds.forEach(noticeId => {
      result[noticeId] =
        this.readStatus.get(noticeId)?.has(userId) ||
        this.defaultReadNoticeIds.has(noticeId) ||
        false;
    });
    return result;
  }

  async markAsRead(userId: string, noticeId: string): Promise<void> {
    if (!this.readStatus.has(noticeId)) {
      this.readStatus.set(noticeId, new Set());
    }
    this.readStatus.get(noticeId)?.add(userId);
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

  async toggleBookmark(noticeId: string, userId: string): Promise<boolean> {
    if (!this.bookmarks.has(noticeId)) {
      this.bookmarks.set(noticeId, new Set());
    }

    const noticeBookmarks = this.bookmarks.get(noticeId)!;
    const notice = this.notices.get(noticeId);

    if (noticeBookmarks.has(userId)) {
      noticeBookmarks.delete(userId);
      if (notice) {
        notice.bookmarkCount = Math.max(0, (notice.bookmarkCount || 0) - 1);
        notice.isBookmarked = false;
      }
      return false;
    }

    noticeBookmarks.add(userId);
    if (notice) {
      notice.bookmarkCount = (notice.bookmarkCount || 0) + 1;
      notice.isBookmarked = true;
    }
    return true;
  }

  async isBookmarked(noticeId: string, userId: string): Promise<boolean> {
    return this.bookmarks.get(noticeId)?.has(userId) || false;
  }

  async getComments(noticeId: string): Promise<NoticeCommentTreeNode[]> {
    return buildCommentTree(this.comments.get(noticeId) || []);
  }

  subscribeToComments(
    noticeId: string,
    callbacks: SubscriptionCallbacks<NoticeCommentTreeNode[]>,
  ): Unsubscribe {
    this.getComments(noticeId).then(comments => {
      callbacks.onData(comments);
    });
    return () => {};
  }

  async createComment(
    noticeId: string,
    comment: CommentFormData & {
      userId: string;
      userDisplayName: string;
    },
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
      isLiked: false,
      likeCount: 0,
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

  async toggleCommentLike(
    noticeId: string,
    commentId: string,
    userId: string,
  ) {
    const currentComments = this.comments.get(noticeId) || [];
    const targetComment = currentComments.find(comment => comment.id === commentId);

    if (!targetComment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    const targetLikes = this.commentLikes.get(commentId) ?? new Set<string>();
    const nextLiked = !targetLikes.has(userId);

    if (nextLiked) {
      targetLikes.add(userId);
    } else {
      targetLikes.delete(userId);
    }

    this.commentLikes.set(commentId, targetLikes);
    this.comments.set(
      noticeId,
      currentComments.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: nextLiked,
              likeCount: Math.max(
                0,
                (comment.likeCount ?? 0) + (nextLiked ? 1 : -1),
              ),
              updatedAt: new Date(),
            }
          : comment,
      ),
    );

    return {
      commentId,
      isLiked: nextLiked,
      likeCount: Math.max(
        0,
        (targetComment.likeCount ?? 0) + (nextLiked ? 1 : -1),
      ),
    };
  }

  async updateComment(
    noticeId: string,
    commentId: string,
    content: string,
  ): Promise<void> {
    const comments = this.comments.get(noticeId) || [];
    const updated = comments.map(comment =>
      comment.id === commentId
        ? {...comment, content, updatedAt: new Date()}
        : comment,
    );
    this.comments.set(noticeId, updated);
  }

  async deleteComment(noticeId: string, commentId: string): Promise<void> {
    const comments = this.comments.get(noticeId) || [];
    const updated = comments.map(comment =>
      comment.id === commentId ? {...comment, isDeleted: true} : comment,
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
    this.bookmarks.clear();
    this.comments.clear();
  }

  private getOrderedNotices(category: string, search?: string): Notice[] {
    const normalizedSearch = search?.trim().toLowerCase();

    return Array.from(this.notices.values())
      .filter(notice => category === '전체' || notice.category === category)
      .filter(notice => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          notice.title.toLowerCase().includes(normalizedSearch) ||
          notice.content.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime(),
      );
  }

  private getCursor(notices: Notice[]): string | null {
    return notices.length > 0 ? notices[notices.length - 1].id : null;
  }

  private getNoticePage(
    category: string,
    cursor: unknown,
    limit: number,
    search?: string,
  ): NoticeListPage {
    const notices = this.getOrderedNotices(category, search);
    const cursorId = typeof cursor === 'string' ? cursor : null;
    const startIndex = cursorId
      ? notices.findIndex(notice => notice.id === cursorId) + 1
      : 0;

    if (cursorId && startIndex === 0) {
      return {data: [], hasMore: false, cursor: null, totalElements: 0};
    }

    const page = notices.slice(startIndex, startIndex + limit);

    return {
      data: page,
      hasMore: notices.length > startIndex + page.length,
      cursor: this.getCursor(page),
      totalElements: notices.length,
    };
  }
}
