// SKTaxi: 공지사항 댓글 훅 (Repository 패턴 적용)

import { useState, useEffect, useCallback } from 'react';
import { useNoticeRepository } from '../../di/useRepository';
import { useAuth } from '../auth';
import { NoticeCommentTreeNode } from '../../repositories/interfaces/INoticeRepository';

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

/**
 * 공지사항 댓글을 관리하는 훅 (Repository 패턴)
 * 실시간 구독 및 CRUD 기능 제공
 */
export function useNoticeComments(noticeId: string): UseNoticeCommentsResult {
  const { user } = useAuth();
  const noticeRepository = useNoticeRepository();
  const [comments, setComments] = useState<NoticeCommentTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 댓글 목록 실시간 구독
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
          // 익명 댓글 순서 계산을 위한 처리
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

  // 댓글 작성
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

  // 댓글 수정
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

  // 댓글 삭제
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

  // 대댓글 작성
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

/**
 * 익명 댓글 순서를 계산하여 트리에 적용
 */
function processAnonymousOrder(
  commentTree: NoticeCommentTreeNode[],
  noticeId: string
): NoticeCommentTreeNode[] {
  const anonymousOrderMap: Record<string, number> = {};
  let anonymousCounter = 1;

  // 모든 댓글을 평면화하여 시간순 정렬
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

  // 시간순으로 정렬하여 익명 순서 할당
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

  // 트리 구조에 익명 순서 적용
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
