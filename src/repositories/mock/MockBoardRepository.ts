// SKTaxi: Board Repository Mock 구현체
// 테스트 및 개발용 Mock 데이터 제공

import { BoardPost, BoardComment, BoardImage } from '../../types/board';
import {
  IBoardRepository,
  BoardFilterOptions,
  CommentTreeNode,
} from '../interfaces/IBoardRepository';
import { PaginatedResult } from '../interfaces/IChatRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../interfaces/IPartyRepository';

/**
 * Mock Board Repository 구현체
 */
export class MockBoardRepository implements IBoardRepository {
  private posts: Map<string, BoardPost> = new Map();
  private comments: Map<string, BoardComment[]> = new Map();
  private likes: Map<string, Set<string>> = new Map(); // postId -> Set<userId>
  private bookmarks: Map<string, Set<string>> = new Map(); // postId -> Set<userId>

  constructor() {
    // 기본 테스트 게시글 추가
    const now = new Date();
    this.posts.set('post1', {
      id: 'post1',
      authorId: 'user1',
      authorDisplayName: '테스트 사용자 1',
      title: '테스트 게시글',
      content: '이것은 테스트 게시글입니다.',
      category: 'free',
      createdAt: now as any,
      updatedAt: now as any,
      viewCount: 10,
      likeCount: 2,
      commentCount: 1,
      bookmarkCount: 0,
      isAnonymous: false,
    });
  }

  async getPosts(
    filters: BoardFilterOptions,
    limit: number
  ): Promise<PaginatedResult<BoardPost>> {
    let posts = Array.from(this.posts.values());
    if (filters.category) {
      posts = posts.filter(p => p.category === filters.category);
    }
    if (filters.authorId) {
      posts = posts.filter(p => p.authorId === filters.authorId);
    }
    posts = posts.slice(0, limit);
    return {
      data: posts,
      hasMore: Array.from(this.posts.values()).length > limit,
      cursor: posts.length > 0 ? posts[posts.length - 1].createdAt : null,
    };
  }

  async getMorePosts(
    filters: BoardFilterOptions,
    cursor: unknown,
    limit: number
  ): Promise<PaginatedResult<BoardPost>> {
    return this.getPosts(filters, limit);
  }

  subscribeToPosts(
    filters: BoardFilterOptions,
    limit: number,
    callbacks: SubscriptionCallbacks<BoardPost[]>
  ): Unsubscribe {
    this.getPosts(filters, limit).then(result => {
      callbacks.onData(result.data);
    });
    return () => {};
  }

  async getPost(postId: string): Promise<BoardPost | null> {
    return this.posts.get(postId) || null;
  }

  subscribeToPost(
    postId: string,
    callbacks: SubscriptionCallbacks<BoardPost | null>
  ): Unsubscribe {
    const post = this.posts.get(postId) || null;
    setTimeout(() => callbacks.onData(post), 10);
    return () => {};
  }

  async createPost(
    post: Omit<BoardPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount' | 'bookmarkCount'>
  ): Promise<string> {
    const id = `post-${Date.now()}`;
    const now = new Date();
    const newPost: BoardPost = {
      ...post,
      id,
      createdAt: now as any,
      updatedAt: now as any,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
    };
    this.posts.set(id, newPost);
    return id;
  }

  async updatePost(postId: string, updates: Partial<BoardPost>): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      this.posts.set(postId, { ...post, ...updates, updatedAt: new Date() as any });
    }
  }

  async deletePost(postId: string): Promise<void> {
    this.posts.delete(postId);
    this.comments.delete(postId);
  }

  async toggleLike(postId: string, userId: string): Promise<boolean> {
    if (!this.likes.has(postId)) {
      this.likes.set(postId, new Set());
    }
    const postLikes = this.likes.get(postId)!;
    const post = this.posts.get(postId);

    if (postLikes.has(userId)) {
      postLikes.delete(userId);
      if (post) {
        post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
      }
      return false;
    } else {
      postLikes.add(userId);
      if (post) {
        post.likeCount = (post.likeCount || 0) + 1;
      }
      return true;
    }
  }

  async isLiked(postId: string, userId: string): Promise<boolean> {
    return this.likes.get(postId)?.has(userId) || false;
  }

  async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    if (!this.bookmarks.has(postId)) {
      this.bookmarks.set(postId, new Set());
    }
    const postBookmarks = this.bookmarks.get(postId)!;
    const post = this.posts.get(postId);

    if (postBookmarks.has(userId)) {
      postBookmarks.delete(userId);
      if (post) {
        post.bookmarkCount = Math.max(0, (post.bookmarkCount || 0) - 1);
      }
      return false;
    } else {
      postBookmarks.add(userId);
      if (post) {
        post.bookmarkCount = (post.bookmarkCount || 0) + 1;
      }
      return true;
    }
  }

  async isBookmarked(postId: string, userId: string): Promise<boolean> {
    return this.bookmarks.get(postId)?.has(userId) || false;
  }

  async incrementViewCount(postId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      post.viewCount = (post.viewCount || 0) + 1;
    }
  }

  async getComments(postId: string): Promise<CommentTreeNode[]> {
    const comments = this.comments.get(postId) || [];
    return comments.map(c => ({ ...c, replies: [] }));
  }

  subscribeToComments(
    postId: string,
    callbacks: SubscriptionCallbacks<CommentTreeNode[]>
  ): Unsubscribe {
    this.getComments(postId).then(comments => {
      callbacks.onData(comments);
    });
    return () => {};
  }

  async createComment(
    postId: string,
    comment: Omit<BoardComment, 'id' | 'postId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const id = `comment-${Date.now()}`;
    const now = new Date();
    const newComment: BoardComment = {
      ...comment,
      id,
      postId,
      createdAt: now as any,
      updatedAt: now as any,
    };
    const comments = this.comments.get(postId) || [];
    this.comments.set(postId, [...comments, newComment]);

    const post = this.posts.get(postId);
    if (post) {
      post.commentCount = (post.commentCount || 0) + 1;
    }

    return id;
  }

  async updateComment(postId: string, commentId: string, content: string): Promise<void> {
    const comments = this.comments.get(postId) || [];
    const updated = comments.map(c =>
      c.id === commentId ? { ...c, content, updatedAt: new Date() as any } : c
    );
    this.comments.set(postId, updated);
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    const comments = this.comments.get(postId) || [];
    this.comments.set(postId, comments.filter(c => c.id !== commentId));

    const post = this.posts.get(postId);
    if (post) {
      post.commentCount = Math.max(0, (post.commentCount || 0) - 1);
    }
  }

  async uploadImage(uri: string, postId?: string): Promise<BoardImage> {
    return {
      id: `img-${Date.now()}`,
      url: uri,
      thumbnailUrl: uri,
      width: 800,
      height: 600,
    };
  }

  async deleteImage(imageUrl: string): Promise<void> {
    console.log(`[Mock] 이미지 삭제: ${imageUrl}`);
  }

  async getCategoryCounts(categories: string[]): Promise<Record<string, number>> {
    const result: Record<string, number> = { all: this.posts.size };
    categories.forEach(cat => {
      result[cat] = Array.from(this.posts.values()).filter(p => p.category === cat).length;
    });
    return result;
  }

  // 테스트용 헬퍼 메서드
  addMockPost(post: BoardPost): void {
    this.posts.set(post.id, post);
  }

  clearMockData(): void {
    this.posts.clear();
    this.comments.clear();
    this.likes.clear();
    this.bookmarks.clear();
  }
}
