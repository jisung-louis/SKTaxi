import type { CommentThreadItem } from '@/shared/ui/comments';

import type { BoardComment } from '../model/types';
import type { BoardCommentTreeNode } from '../data/repositories/IBoardRepository';

interface BoardCommentThreadOptions {
  currentUserId?: string;
  postAuthorId?: string;
  blockedAuthorMap?: Record<string, boolean>;
}

export function buildBoardCommentPayload(
  params: Pick<BoardComment, 'authorId' | 'authorName' | 'authorProfileImage'> & {
    content: string;
    postId: string;
    parentId?: string;
    isAnonymous?: boolean;
  },
): Omit<BoardComment, 'id' | 'postId' | 'createdAt' | 'updatedAt'> {
  const { authorId, authorName, authorProfileImage, content, postId, parentId, isAnonymous } =
    params;

  return {
    authorId,
    authorName,
    authorProfileImage,
    content: content.trim(),
    isAnonymous: !!isAnonymous,
    anonId: isAnonymous ? `${postId}:${authorId}` : null,
    parentId: parentId ?? null,
    isDeleted: false,
  };
}

export function collectBoardCommentAuthorIds(commentTree: BoardCommentTreeNode[]): string[] {
  const authorIds = new Set<string>();

  const walk = (nodes: BoardCommentTreeNode[]) => {
    nodes.forEach((node) => {
      if (node.authorId) {
        authorIds.add(node.authorId);
      }
      if (node.replies.length > 0) {
        walk(node.replies);
      }
    });
  };

  walk(commentTree);

  return Array.from(authorIds);
}

export function processBoardCommentAnonymousOrder(
  commentTree: BoardCommentTreeNode[],
  postId: string,
): BoardCommentTreeNode[] {
  const anonymousOrderMap: Record<string, number> = {};
  let anonymousCounter = 1;

  const flattenComments = (nodes: BoardCommentTreeNode[]): BoardCommentTreeNode[] => {
    const result: BoardCommentTreeNode[] = [];

    for (const node of nodes) {
      result.push(node);
      if (node.replies.length > 0) {
        result.push(...flattenComments(node.replies));
      }
    }

    return result;
  };

  flattenComments(commentTree)
    .slice()
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .forEach((comment) => {
      if (!comment.isAnonymous) {
        return;
      }

      const anonKey = `${postId}:${comment.authorId}`;
      if (!anonymousOrderMap[anonKey]) {
        anonymousOrderMap[anonKey] = anonymousCounter++;
      }
    });

  const applyAnonymousOrder = (nodes: BoardCommentTreeNode[]): BoardCommentTreeNode[] =>
    nodes.map((node) => ({
      ...node,
      anonymousOrder: node.isAnonymous
        ? anonymousOrderMap[`${postId}:${node.authorId}`]
        : undefined,
      replies: applyAnonymousOrder(node.replies),
    }));

  return applyAnonymousOrder(commentTree);
}

export function toBoardCommentThreadItems(
  commentTree: BoardCommentTreeNode[],
  options: BoardCommentThreadOptions,
): CommentThreadItem[] {
  const { blockedAuthorMap = {}, currentUserId, postAuthorId } = options;

  const mapNode = (node: BoardCommentTreeNode): CommentThreadItem => {
    const hiddenReason = node.isDeleted
      ? 'deleted'
      : blockedAuthorMap[node.authorId]
        ? 'blocked'
        : undefined;

    return {
      id: node.id,
      content: node.content,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      authorId: node.authorId,
      authorName: node.isAnonymous
        ? node.anonymousOrder
          ? `익명${node.anonymousOrder}`
          : '익명'
        : node.authorName,
      isAnonymous: node.isAnonymous,
      anonymousOrder: node.anonymousOrder,
      parentId: node.parentId,
      isDeleted: node.isDeleted,
      hiddenReason,
      authorBadgeLabel: node.authorId === postAuthorId ? '작성자' : undefined,
      canReply: Boolean(currentUserId) && !hiddenReason,
      canEdit: Boolean(currentUserId) && currentUserId === node.authorId && !hiddenReason,
      canDelete: Boolean(currentUserId) && currentUserId === node.authorId && !hiddenReason,
      canReport:
        Boolean(currentUserId) &&
        currentUserId !== node.authorId &&
        !hiddenReason,
      replies: node.replies.map(mapNode),
    };
  };

  return commentTree.map(mapNode);
}
