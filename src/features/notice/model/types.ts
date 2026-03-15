export interface NoticeAttachment {
  name: string;
  downloadUrl: string;
  previewUrl: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  link: string;
  postedAt: any;
  category: string;
  createdAt: string;
  author: string;
  department: string;
  source: string;
  contentDetail: string;
  contentAttachments: NoticeAttachment[];
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
}

export type ReadStatusMap = Record<string, boolean>;

export interface NoticeFilterOptions {
  category?: string;
}

export interface NoticeComment {
  id: string;
  noticeId: string;
  userId: string;
  userDisplayName: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  parentId?: string | null;
  replyCount?: number;
  isAnonymous?: boolean;
  anonId?: string;
  anonymousOrder?: number;
  replies?: NoticeComment[];
}

export interface NoticeCommentFormData {
  content: string;
  parentId?: string | null;
  isAnonymous?: boolean;
}

export interface NoticeCommentTreeNode extends NoticeComment {
  replies: NoticeCommentTreeNode[];
}

export interface NoticeForegroundNotificationPayload {
  noticeId: string;
  title: string;
  body: string;
  type: 'notice' | 'notice_notification';
}

export type Comment = NoticeComment;
export type CommentFormData = NoticeCommentFormData;
