export interface BoardPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorProfileImage?: string;
  category: 'general' | 'question' | 'review' | 'announcement';
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isPinned: boolean;
  isDeleted: boolean;
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
  parentId?: string; // 대댓글용
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardCategory {
  id: string;
  name: string;
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
}

