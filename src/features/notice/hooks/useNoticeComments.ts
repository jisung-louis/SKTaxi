import { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/features/auth';

import type { NoticeCommentTreeNode } from '../model/types';
import { useNoticeRepository } from './useNoticeRepository';

export interface UseNoticeCommentsResult {
  /** 댓글 목록 (트리 구조) */
  comments: NoticeCommentTreeNode[];
  /** 로딩 상태 */
  loading: boolean;
  /** 제출 중 상태 */
  submitting: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 댓글 작성 */
  addComment: (content: string, parentId?: string, isAnonymous?: boolean) => Promise<void>;
  /** 댓글 수정 */
  updateComment: (commentId: string, content: string) => Promise<void>;
  /** 댓글 삭제 */
  deleteComment: (commentId: string) => Promise<void>;
  /** 대댓글 작성 */
  addReply: (parentId: string, content: string, isAnonymous?: boolean) => Promise<void>;
}

export function useNoticeComments(noticeId: string): UseNoticeCommentsResult {
  const { user } = useAuth();
  const noticeRepository = useNoticeRepository();
  const [comments, setComments] = useState<NoticeCommentTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noticeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = noticeRepository.subscribeToComments(
      noticeId,
      {
        onData: (commentTree) => {
          const processedComments = processAnonymousOrder(commentTree, noticeId);
          setComments(processedComments);
          setLoading(false);
        },
        onError: (err) => {
          console.error('댓글 구독 실패:', err);
          setError('댓글을 불러오는데 실패했습니다.');
          setLoading(false);
        },
      }
    );

    return () => unsubscribe();
  }, [noticeId, noticeRepository]);

  const addComment = useCallback(async (content: string, parentId?: string, isAnonymous?: boolean) => {
    if (!user?.uid || !content.trim()) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    try {
      setSubmitting(true);
      setError(null);

      await noticeRepository.createComment(noticeId, {
        content: content.trim(),
        parentId: parentId ?? null,
        isAnonymous: !!isAnonymous,
        userId: user.uid,
        userDisplayName: user.displayName || '익명',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '댓글 작성에 실패했습니다.';
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  }, [noticeId, user?.uid, user?.displayName, noticeRepository]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!user?.uid || !content.trim()) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    try {
      setSubmitting(true);
      setError(null);

      await noticeRepository.updateComment(noticeId, commentId, content.trim());
    } catch (err) {
      const message = err instanceof Error ? err.message : '댓글 수정에 실패했습니다.';
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  }, [noticeId, user?.uid, noticeRepository]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user?.uid) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setSubmitting(true);
      setError(null);

      await noticeRepository.deleteComment(noticeId, commentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : '댓글 삭제에 실패했습니다.';
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  }, [noticeId, user?.uid, noticeRepository]);

  const addReply = useCallback(async (parentId: string, content: string, isAnonymous?: boolean) => {
    return addComment(content, parentId, isAnonymous);
  }, [addComment]);

  return {
    comments,
    loading,
    submitting,
    error,
    addComment,
    updateComment,
    deleteComment,
    addReply,
  };
}

function processAnonymousOrder(
  commentTree: NoticeCommentTreeNode[],
  noticeId: string
): NoticeCommentTreeNode[] {
  const anonymousOrderMap: Record<string, number> = {};
  let anonymousCounter = 1;

  const flattenComments = (nodes: NoticeCommentTreeNode[]): NoticeCommentTreeNode[] => {
    const result: NoticeCommentTreeNode[] = [];
    for (const node of nodes) {
      result.push(node);
      if (node.replies.length > 0) {
        result.push(...flattenComments(node.replies));
      }
    }
    return result;
  };

  const allComments = flattenComments(commentTree);

  allComments
    .slice()
    .sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return aTime - bTime;
    })
    .forEach((comment) => {
      if (comment.isAnonymous) {
        const anonKey = `${noticeId}:${comment.userId}`;
        if (!anonymousOrderMap[anonKey]) {
          anonymousOrderMap[anonKey] = anonymousCounter++;
        }
      }
    });

  const applyAnonymousOrder = (nodes: NoticeCommentTreeNode[]): NoticeCommentTreeNode[] => {
    return nodes.map((node) => ({
      ...node,
      anonymousOrder: node.isAnonymous
        ? anonymousOrderMap[`${noticeId}:${node.userId}`]
        : undefined,
      replies: applyAnonymousOrder(node.replies),
    }));
  };

  return applyAnonymousOrder(commentTree);
}
