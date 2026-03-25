import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import type { PaginatedResult } from '@/shared/types/pagination';

import type {
  BoardComment,
  BoardImage,
  BoardPost,
} from '../../model/types';
import { BOARD_POSTS_MOCK } from '../../mocks/boardPost.mock';
import type {
  BoardCommentTreeNode,
  BoardFilterOptions,
  IBoardRepository,
} from './IBoardRepository';

const posts = new Map<string, BoardPost>();
const comments = new Map<string, BoardComment[]>();
const likes = new Map<string, Set<string>>();
const bookmarks = new Map<string, Set<string>>();
const postSubscriptions = new Set<{
  callbacks: SubscriptionCallbacks<BoardPost[]>;
  filters: BoardFilterOptions;
  limit: number;
}>();
const postDetailSubscriptions = new Map<
  string,
  Set<SubscriptionCallbacks<BoardPost | null>>
>();
const commentSubscriptions = new Map<
  string,
  Set<SubscriptionCallbacks<BoardCommentTreeNode[]>>
>();

const makeDate = (value: string) => new Date(value);

const ensureSeeded = () => {
  if (posts.size > 0) {
    return;
  }

  BOARD_POSTS_MOCK.forEach((post, index) => {
    posts.set(post.id, {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: `board-author-${index + 1}`,
      authorName: post.authorName,
      authorProfileImage: null,
      isAnonymous: post.isAnonymous,
      category: post.category,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      bookmarkCount: post.bookmarkCount,
      isPinned: false,
      isDeleted: false,
      createdAt: makeDate(post.createdAt),
      updatedAt: makeDate(post.createdAt),
    });
    comments.set(post.id, []);
  });
};

ensureSeeded();

const clonePost = (post: BoardPost): BoardPost => ({
  ...post,
  createdAt: new Date(post.createdAt),
  updatedAt: new Date(post.updatedAt),
  lastCommentAt: post.lastCommentAt ? new Date(post.lastCommentAt) : undefined,
  images: post.images?.map(image => ({ ...image })),
});

const cloneComment = (comment: BoardComment): BoardComment => ({
  ...comment,
  createdAt: new Date(comment.createdAt),
  updatedAt: new Date(comment.updatedAt),
});

const matchesFilters = (post: BoardPost, filters: BoardFilterOptions) => {
  if (post.isDeleted) {
    return false;
  }

  if (filters.category && post.category !== filters.category) {
    return false;
  }

  if (filters.authorId && post.authorId !== filters.authorId) {
    return false;
  }

  if (filters.searchText) {
    const haystack = `${post.title} ${post.content}`.toLowerCase();
    if (!haystack.includes(filters.searchText.trim().toLowerCase())) {
      return false;
    }
  }

  return true;
};

const sortPosts = (items: BoardPost[], sortBy: BoardFilterOptions['sortBy']) => {
  const nextItems = [...items];

  nextItems.sort((left, right) => {
    if (sortBy === 'popular') {
      return right.likeCount - left.likeCount;
    }

    if (sortBy === 'mostCommented') {
      return right.commentCount - left.commentCount;
    }

    if (sortBy === 'mostViewed') {
      return right.viewCount - left.viewCount;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });

  return nextItems;
};

const resolvePosts = (filters: BoardFilterOptions) =>
  sortPosts(
    Array.from(posts.values()).filter(post => matchesFilters(post, filters)),
    filters.sortBy,
  );

const buildPage = (
  filteredPosts: BoardPost[],
  cursor: unknown,
  limit: number,
): PaginatedResult<BoardPost> => {
  const cursorId = typeof cursor === 'string' ? cursor : null;
  const startIndex = cursorId
    ? filteredPosts.findIndex(post => post.id === cursorId) + 1
    : 0;
  const page = filteredPosts.slice(startIndex, startIndex + limit).map(clonePost);

  return {
    data: page,
    hasMore: filteredPosts.length > startIndex + page.length,
    cursor: page.length > 0 ? page[page.length - 1].id : null,
  };
};

const buildCommentTree = (postId: string): BoardCommentTreeNode[] => {
  const postComments = comments.get(postId) ?? [];
  const nodes = new Map<string, BoardCommentTreeNode>();
  const roots: BoardCommentTreeNode[] = [];

  postComments.forEach(comment => {
    nodes.set(comment.id, {
      ...cloneComment(comment),
      replies: [],
    });
  });

  postComments.forEach(comment => {
    const node = nodes.get(comment.id)!;
    if (comment.parentId) {
      nodes.get(comment.parentId)?.replies.push(node);
      return;
    }

    roots.push(node);
  });

  return roots;
};

const emitPosts = () => {
  postSubscriptions.forEach(subscription => {
    subscription.callbacks.onData(
      resolvePosts(subscription.filters).slice(0, subscription.limit).map(clonePost),
    );
  });
};

const emitPost = (postId: string) => {
  const post = posts.get(postId) ?? null;
  postDetailSubscriptions.get(postId)?.forEach(callbacks => {
    callbacks.onData(post ? clonePost(post) : null);
  });
};

const emitComments = (postId: string) => {
  const tree = buildCommentTree(postId);
  commentSubscriptions.get(postId)?.forEach(callbacks => {
    callbacks.onData(tree);
  });
};

const nextId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export class MockBoardRepository implements IBoardRepository {
  async getPosts(
    filters: BoardFilterOptions,
    limit: number,
  ): Promise<PaginatedResult<BoardPost>> {
    return buildPage(resolvePosts(filters), null, limit);
  }

  async getMorePosts(
    filters: BoardFilterOptions,
    cursor: unknown,
    limit: number,
  ): Promise<PaginatedResult<BoardPost>> {
    return buildPage(resolvePosts(filters), cursor, limit);
  }

  subscribeToPosts(
    filters: BoardFilterOptions,
    limit: number,
    callbacks: SubscriptionCallbacks<BoardPost[]>,
  ): Unsubscribe {
    const subscription = { filters, limit, callbacks };
    postSubscriptions.add(subscription);
    callbacks.onData(resolvePosts(filters).slice(0, limit).map(clonePost));

    return () => {
      postSubscriptions.delete(subscription);
    };
  }

  async getPost(postId: string): Promise<BoardPost | null> {
    const post = posts.get(postId);
    return post ? clonePost(post) : null;
  }

  subscribeToPost(
    postId: string,
    callbacks: SubscriptionCallbacks<BoardPost | null>,
  ): Unsubscribe {
    const bucket = postDetailSubscriptions.get(postId) ?? new Set();
    bucket.add(callbacks);
    postDetailSubscriptions.set(postId, bucket);
    callbacks.onData(posts.get(postId) ? clonePost(posts.get(postId)!) : null);

    return () => {
      postDetailSubscriptions.get(postId)?.delete(callbacks);
    };
  }

  async createPost(
    post: Omit<
      BoardPost,
      'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount' | 'bookmarkCount'
    >,
  ): Promise<string> {
    const id = nextId('mock-board-post');
    const now = new Date();

    posts.set(id, {
      ...post,
      id,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    comments.set(id, []);
    emitPosts();
    emitPost(id);

    return id;
  }

  async updatePost(postId: string, updates: Partial<BoardPost>): Promise<void> {
    const current = posts.get(postId);
    if (!current) {
      return;
    }

    posts.set(postId, {
      ...current,
      ...updates,
      updatedAt: new Date(),
    });
    emitPosts();
    emitPost(postId);
  }

  async deletePost(postId: string): Promise<void> {
    const current = posts.get(postId);
    if (!current) {
      return;
    }

    posts.set(postId, {
      ...current,
      isDeleted: true,
      updatedAt: new Date(),
    });
    emitPosts();
    emitPost(postId);
  }

  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const post = posts.get(postId);
    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    const postLikes = likes.get(postId) ?? new Set<string>();
    const nextLiked = !postLikes.has(userId);

    if (nextLiked) {
      postLikes.add(userId);
    } else {
      postLikes.delete(userId);
    }

    likes.set(postId, postLikes);
    posts.set(postId, {
      ...post,
      likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
      updatedAt: new Date(),
    });

    emitPosts();
    emitPost(postId);
    return nextLiked;
  }

  async isLiked(postId: string, userId: string): Promise<boolean> {
    return likes.get(postId)?.has(userId) ?? false;
  }

  async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    const post = posts.get(postId);
    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    const postBookmarks = bookmarks.get(postId) ?? new Set<string>();
    const nextBookmarked = !postBookmarks.has(userId);

    if (nextBookmarked) {
      postBookmarks.add(userId);
    } else {
      postBookmarks.delete(userId);
    }

    bookmarks.set(postId, postBookmarks);
    posts.set(postId, {
      ...post,
      bookmarkCount: Math.max(0, post.bookmarkCount + (nextBookmarked ? 1 : -1)),
      updatedAt: new Date(),
    });

    emitPosts();
    emitPost(postId);
    return nextBookmarked;
  }

  async isBookmarked(postId: string, userId: string): Promise<boolean> {
    return bookmarks.get(postId)?.has(userId) ?? false;
  }

  async incrementViewCount(postId: string): Promise<void> {
    const post = posts.get(postId);
    if (!post) {
      return;
    }

    posts.set(postId, {
      ...post,
      viewCount: post.viewCount + 1,
    });
    emitPosts();
    emitPost(postId);
  }

  async getComments(postId: string): Promise<BoardCommentTreeNode[]> {
    return buildCommentTree(postId);
  }

  subscribeToComments(
    postId: string,
    callbacks: SubscriptionCallbacks<BoardCommentTreeNode[]>,
  ): Unsubscribe {
    const bucket = commentSubscriptions.get(postId) ?? new Set();
    bucket.add(callbacks);
    commentSubscriptions.set(postId, bucket);
    callbacks.onData(buildCommentTree(postId));

    return () => {
      commentSubscriptions.get(postId)?.delete(callbacks);
    };
  }

  async createComment(
    postId: string,
    comment: Omit<BoardComment, 'id' | 'postId' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> {
    const id = nextId('mock-board-comment');
    const now = new Date();
    const nextComment: BoardComment = {
      ...comment,
      id,
      postId,
      createdAt: now,
      updatedAt: now,
    };

    const postComments = comments.get(postId) ?? [];
    comments.set(postId, [...postComments, nextComment]);

    const post = posts.get(postId);
    if (post) {
      posts.set(postId, {
        ...post,
        commentCount: post.commentCount + 1,
        lastCommentAt: now,
        updatedAt: now,
      });
      emitPosts();
      emitPost(postId);
    }

    emitComments(postId);
    return id;
  }

  async updateComment(postId: string, commentId: string, content: string): Promise<void> {
    comments.set(
      postId,
      (comments.get(postId) ?? []).map(comment =>
        comment.id === commentId
          ? { ...comment, content, updatedAt: new Date() }
          : comment,
      ),
    );
    emitComments(postId);
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    comments.set(
      postId,
      (comments.get(postId) ?? []).filter(comment => comment.id !== commentId),
    );

    const post = posts.get(postId);
    if (post) {
      posts.set(postId, {
        ...post,
        commentCount: Math.max(0, post.commentCount - 1),
        updatedAt: new Date(),
      });
      emitPosts();
      emitPost(postId);
    }

    emitComments(postId);
  }

  async uploadImage(uri: string, postId?: string): Promise<BoardImage> {
    const suffix = postId ?? 'draft';
    return {
      url: `https://mock-storage.skuri.local/board/${suffix}/${encodeURIComponent(uri.split('/').pop() ?? 'image.jpg')}`,
      width: 1080,
      height: 1080,
    };
  }

  async deleteImage(_imageUrl: string): Promise<void> {}

  async getCategoryCounts(categories: string[]): Promise<Record<string, number>> {
    return categories.reduce<Record<string, number>>((accumulator, category) => {
      accumulator[category] = Array.from(posts.values()).filter(
        post => !post.isDeleted && post.category === category,
      ).length;
      return accumulator;
    }, {});
  }
}
