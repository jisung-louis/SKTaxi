export interface BoardImage {
  url: string;
  width: number;
  height: number;
  thumbUrl?: string;
  size?: number;
  mime?: string;
}

export interface BoardPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorProfileImage?: string;
  isAnonymous?: boolean;
  anonId?: string; // 글 단위 익명 사용자 식별자(동일 글 내 일관성)
  category: 'general' | 'question' | 'review' | 'announcement';
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isPinned: boolean;
  isDeleted: boolean;
  images?: BoardImage[];
  createdAt: Date;
  updatedAt: Date;
  lastCommentAt?: Date;
}

export interface BoardComment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorProfileImage?: string;
  isAnonymous?: boolean;
  anonId?: string;
  anonymousOrder?: number; // 익명 댓글 순서 (익명1, 익명2, ...)
  parentId?: string; // 대댓글용
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardCategory {
  id: string;
  name: string;
  shortName: string;
  description: string;
  postCount: number;
  color: string;
}

export interface BoardSearchFilters {
  searchText?: string;
  category?: string;
  authorId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy: 'latest' | 'popular' | 'mostCommented' | 'mostViewed';
}

export interface BoardFormData {
  title: string;
  content: string;
  category: string;
  isAnonymous?: boolean;
}

