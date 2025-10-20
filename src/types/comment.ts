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
  isAnonymous?: boolean; // 익명 여부
  anonId?: string; // 익명 ID (userId + noticeId 조합)
  anonymousOrder?: number; // 익명 순서 (익명1, 익명2, ...)
  replies?: Comment[]; // 대댓글 목록
}

export interface CommentFormData {
  content: string;
  parentId?: string;
  isAnonymous?: boolean;
}
