import type { PaginatedResult } from '@/shared/types/pagination';
import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/repositories/interfaces/IPartyRepository';

import type { BoardComment, BoardImage, BoardPost } from '../../model/types';
import type {
  BoardCommentTreeNode,
  BoardFilterOptions,
  IBoardRepository,
} from './IBoardRepository';

export class MockBoardRepository implements IBoardRepository {
  private posts: Map<string, BoardPost> = new Map();
  private comments: Map<string, BoardComment[]> = new Map();
  private likes: Map<string, Set<string>> = new Map();
  private bookmarks: Map<string, Set<string>> = new Map();

  constructor() {
    const now = new Date();
    this.posts.set('post1', {
      id: 'post1',
      authorId: 'user1',
      authorName: '테스트 사용자 1',
      title: '테스트 게시글',
      content: '이것은 테스트 게시글입니다.',
      category: 'general',
      createdAt: now,
      updatedAt: now,
      viewCount: 10,
      likeCount: 2,
      commentCount: 1,
      bookmarkCount: 0,
      isAnonymous: false,
      isPinned: false,
      isDeleted: false,
    });
  }

  async getPosts(
    filters: BoardFilterOptions,
    limit: number,
  ): Promise<PaginatedResult<BoardPost>> {
    let posts = Array.from(this.posts.values());
    if (filters.category && filters.category !== 'all') {
      posts = posts.filter((post) => post.category === filters.category);
    }
    if (filters.authorId) {
      posts = posts.filter((post) => post.authorId === filters.authorId);
    }

    const slicedPosts = posts.slice(0, limit);
    return {
      data: slicedPosts,
      hasMore: posts.length > limit,
      cursor: slicedPosts[slicedPosts.length - 1]?.createdAt || null,
    };
  }

  async getMorePosts(
    filters: BoardFilterOptions,
    _cursor: unknown,
    limit: number,
  ): Promise<PaginatedResult<BoardPost>> {
    return this.getPosts(filters, limit);
  }

  subscribeToPosts(
    filters: BoardFilterOptions,
    limit: number,
    callbacks: SubscriptionCallbacks<BoardPost[]>,
  ): Unsubscribe {
    void this.getPosts(filters, limit).then((result) => callbacks.onData(result.data));
    return () => undefined;
  }

  async getPost(postId: string): Promise<BoardPost | null> {
    return this.posts.get(postId) || null;
  }

  subscribeToPost(
    postId: string,
    callbacks: SubscriptionCallbacks<BoardPost | null>,
  ): Unsubscribe {
    setTimeout(() => callbacks.onData(this.posts.get(postId) || null), 10);
    return () => undefined;
  }

  async createPost(
    post: Omit<
      BoardPost,
      'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount' | 'bookmarkCount'
    >,
  ): Promise<string> {
    const id = `post-${Date.now()}`;
    const now = new Date();
    this.posts.set(id, {
      ...post,
      id,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
    });
    return id;
  }

  async updatePost(postId: string, updates: Partial<BoardPost>): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) {
      return;
    }
    this.posts.set(postId, { ...post, ...updates, updatedAt: new Date() });
  }

  async deletePost(postId: string): Promise<void> {
    this.posts.delete(postId);
    this.comments.delete(postId);
  }

  async toggleLike(postId: string, userId: string): Promise<boolean> {
    if (!this.likes.has(postId)) {
      this.likes.set(postId, new Set());
    }

    const likes = this.likes.get(postId)!;
    const post = this.posts.get(postId);

    if (likes.has(userId)) {
      likes.delete(userId);
      if (post) {
        post.likeCount = Math.max(0, post.likeCount - 1);
      }
      return false;
    }

    likes.add(userId);
    if (post) {
      post.likeCount += 1;
    }
    return true;
  }

  async isLiked(postId: string, userId: string): Promise<boolean> {
    return this.likes.get(postId)?.has(userId) || false;
  }

  async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    if (!this.bookmarks.has(postId)) {
      this.bookmarks.set(postId, new Set());
    }

    const bookmarks = this.bookmarks.get(postId)!;
    const post = this.posts.get(postId);

    if (bookmarks.has(userId)) {
      bookmarks.delete(userId);
      if (post) {
        post.bookmarkCount = Math.max(0, post.bookmarkCount - 1);
      }
      return false;
    }

    bookmarks.add(userId);
    if (post) {
      post.bookmarkCount += 1;
    }
    return true;
  }

  async isBookmarked(postId: string, userId: string): Promise<boolean> {
    return this.bookmarks.get(postId)?.has(userId) || false;
  }

  async incrementViewCount(postId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      post.viewCount += 1;
    }
  }

  async getComments(postId: string): Promise<BoardCommentTreeNode[]> {
    return (this.comments.get(postId) || []).map((comment) => ({ ...comment, replies: [] }));
  }

  subscribeToComments(
    postId: string,
    callbacks: SubscriptionCallbacks<BoardCommentTreeNode[]>,
  ): Unsubscribe {
    void this.getComments(postId).then((comments) => callbacks.onData(comments));
    return () => undefined;
  }

  async createComment(
    postId: string,
    comment: Omit<BoardComment, 'id' | 'postId' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> {
    const id = `comment-${Date.now()}`;
    const now = new Date();
    const newComment: BoardComment = {
      ...comment,
      id,
      postId,
      createdAt: now,
      updatedAt: now,
    };
    this.comments.set(postId, [...(this.comments.get(postId) || []), newComment]);

    const post = this.posts.get(postId);
    if (post) {
      post.commentCount += 1;
    }

    return id;
  }

  async updateComment(postId: string, commentId: string, content: string): Promise<void> {
    const comments = this.comments.get(postId) || [];
    this.comments.set(
      postId,
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, content, updatedAt: new Date() } : comment,
      ),
    );
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    const comments = this.comments.get(postId) || [];
    this.comments.set(postId, comments.filter((comment) => comment.id !== commentId));

    const post = this.posts.get(postId);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
    }
  }

  async uploadImage(uri: string, _postId?: string): Promise<BoardImage> {
    return {
      url: uri,
      width: 800,
      height: 600,
      thumbUrl: uri,
    };
  }

  async deleteImage(_imageUrl: string): Promise<void> {
    return;
  }

  async getCategoryCounts(categories: string[]): Promise<Record<string, number>> {
    const counts: Record<string, number> = { all: this.posts.size };
    categories.forEach((categoryId) => {
      counts[categoryId] = Array.from(this.posts.values()).filter(
        (post) => post.category === categoryId,
      ).length;
    });
    return counts;
  }
}
