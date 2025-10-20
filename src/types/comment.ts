export interface Comment {
  id: string;
  noticeId: string;
  userId: string;
  userDisplayName: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  parentId?: string; // 대댓글을 위한 부모 댓글 ID
  replyCount?: number; // 대댓글 개수
}

export interface CommentFormData {
  content: string;
  parentId?: string;
}
