export type CommentHiddenReason = 'blocked' | 'deleted';

export interface CommentThreadItem {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  authorId: string;
  authorName: string;
  isAnonymous?: boolean;
  anonymousOrder?: number;
  parentId?: string | null;
  isDeleted?: boolean;
  hiddenReason?: CommentHiddenReason;
  authorBadgeLabel?: string;
  canReply?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canReport?: boolean;
  replies: CommentThreadItem[];
}
