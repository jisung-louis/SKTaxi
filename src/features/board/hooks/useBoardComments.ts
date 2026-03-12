import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';
import { logEvent } from '@/lib/analytics';
import type { CommentThreadItem } from '@/shared/ui/comments';

import type { BoardCommentTreeNode } from '../data/repositories/IBoardRepository';
import {
  buildBoardCommentPayload,
  collectBoardCommentAuthorIds,
  processBoardCommentAnonymousOrder,
  toBoardCommentThreadItems,
} from '../services/boardCommentService';
import { getBoardHiddenAuthorMap } from '../services/boardModerationService';
import { useBoardRepository } from './useBoardRepository';

interface UseBoardCommentsOptions {
  postAuthorId?: string;
}

export interface UseBoardCommentsResult {
  comments: CommentThreadItem[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  addComment: (content: string, parentId?: string, isAnonymous?: boolean) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  addReply: (parentId: string, content: string, isAnonymous?: boolean) => Promise<void>;
}

export function useBoardComments(
  postId: string,
  options: UseBoardCommentsOptions = {},
): UseBoardCommentsResult {
  const { user } = useAuth();
  const boardRepository = useBoardRepository();
  const [comments, setComments] = useState<CommentThreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildCommentItems = useCallback(
    async (commentTree: BoardCommentTreeNode[]) => {
      const processedComments = processBoardCommentAnonymousOrder(commentTree, postId);
      const blockedAuthorMap = await getBoardHiddenAuthorMap(
        collectBoardCommentAuthorIds(processedComments),
      ).catch(() => ({}));

      setComments(
        toBoardCommentThreadItems(processedComments, {
          currentUserId: user?.uid,
          postAuthorId: options.postAuthorId,
          blockedAuthorMap,
        }),
      );
      setLoading(false);
    },
    [options.postAuthorId, postId, user?.uid],
  );

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = boardRepository.subscribeToComments(postId, {
      onData: (commentTree) => {
        void buildCommentItems(commentTree);
      },
      onError: (err) => {
        console.error('댓글 구독 실패:', err);
        setError('댓글을 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [boardRepository, buildCommentItems, postId]);

  const addComment = useCallback(
    async (content: string, parentId?: string, isAnonymous?: boolean) => {
      if (!user?.uid || !content.trim()) {
        throw new Error('댓글 내용을 입력해주세요.');
      }

      try {
        setSubmitting(true);
        setError(null);

        const commentId = await boardRepository.createComment(
          postId,
          buildBoardCommentPayload({
            authorId: user.uid,
            authorName: user.displayName || '익명',
            authorProfileImage: user.photoURL ?? null,
            content,
            postId,
            parentId,
            isAnonymous,
          }),
        );

        await logEvent('board_comment_created', {
          post_id: postId,
          comment_id: commentId,
          is_anonymous: !!isAnonymous,
          is_reply: !!parentId,
          comment_length: content.trim().length,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '댓글 작성에 실패했습니다.';
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [boardRepository, postId, user?.displayName, user?.photoURL, user?.uid],
  );

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      if (!user?.uid || !content.trim()) {
        throw new Error('댓글 내용을 입력해주세요.');
      }

      try {
        setSubmitting(true);
        setError(null);
        await boardRepository.updateComment(postId, commentId, content.trim());
      } catch (err) {
        const message = err instanceof Error ? err.message : '댓글 수정에 실패했습니다.';
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [boardRepository, postId, user?.uid],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!user?.uid) {
        throw new Error('로그인이 필요합니다.');
      }

      try {
        setSubmitting(true);
        setError(null);
        await boardRepository.deleteComment(postId, commentId);
      } catch (err) {
        const message = err instanceof Error ? err.message : '댓글 삭제에 실패했습니다.';
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [boardRepository, postId, user?.uid],
  );

  const addReply = useCallback(
    async (parentId: string, content: string, isAnonymous?: boolean) => {
      await addComment(content, parentId, isAnonymous);
    },
    [addComment],
  );

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
