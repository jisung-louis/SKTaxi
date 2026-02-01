/**
 * @deprecated 이 훅은 Firebase 직접 접근으로 DIP 원칙 위반.
 * 새로운 코드에서는 hooks/board/useBoardComments 사용 권장.
 * import { useBoardComments } from '../hooks/board';
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  increment,
  serverTimestamp
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { BoardComment } from '../../types/board';
import { db } from '../../config/firebase';
import { useAuth } from './useAuth';
import { logEvent } from '../../lib/analytics';

/** @deprecated hooks/board/useBoardComments 사용 권장 */
export const useBoardComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<(BoardComment & { replies: BoardComment[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(() => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);

      const commentsRef = collection(db, 'boardComments');
      const q = query(
        commentsRef,
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const commentsData: BoardComment[] = [];
        const repliesMap: { [key: string]: BoardComment[] } = {};
        
        snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const data: any = docSnap.data();
          const comment = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as BoardComment;
          
          
          if (comment.parentId) {
            // 대댓글인 경우
            if (!repliesMap[comment.parentId]) {
              repliesMap[comment.parentId] = [];
            }
            repliesMap[comment.parentId].push(comment);
          } else {
            // 댓글인 경우
            commentsData.push(comment);
          }
        });
        
        // 익명 댓글 순서 계산 (댓글과 대댓글 통합)
        const anonymousOrderMap: { [key: string]: number } = {};
        let anonymousCounter = 1;
        
        // 댓글과 대댓글을 시간순으로 정렬하여 익명 순서 계산
        const allComments = [...commentsData];
        commentsData.forEach(comment => {
          const replies = repliesMap[comment.id] || [];
          allComments.push(...replies);
        });
        
        allComments
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .forEach(comment => {
            if (comment.isAnonymous) {
              const anonKey = `${comment.postId}:${comment.authorId}`;
              if (!anonymousOrderMap[anonKey]) {
                anonymousOrderMap[anonKey] = anonymousCounter++;
              }
            }
          });

        // 댓글에 대댓글 추가 (대댓글에도 익명 순서 적용)
        const commentsWithReplies = commentsData.map(comment => ({
          ...comment,
          replies: (repliesMap[comment.id] || []).map(reply => ({
            ...reply,
            anonymousOrder: reply.isAnonymous ? anonymousOrderMap[`${reply.postId}:${reply.authorId}`] : undefined
          })),
          anonymousOrder: comment.isAnonymous ? anonymousOrderMap[`${comment.postId}:${comment.authorId}`] : undefined
        }));
        
        setComments(commentsWithReplies);
        setLoading(false);
      }, (err) => {
        console.error('댓글 구독 실패:', err);
        setError('댓글을 불러오는데 실패했습니다.');
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error('댓글 로드 실패:', err);
      setError('댓글을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content: string, parentId?: string, isAnonymous?: boolean) => {
    if (!postId || !user || !content.trim()) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    try {
      setSubmitting(true);
      setError(null);

      const commentData: any = {
        postId,
        content: content.trim(),
        authorId: user.uid,
        authorName: user.displayName || '익명',
        authorProfileImage: user.photoURL || null,
        isAnonymous: !!isAnonymous,
        parentId: parentId || null,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 익명 댓글이면 anonId 추가
      if (isAnonymous) {
        commentData.anonId = `${postId}:${user.uid}`;
      }

      const commentRef = await addDoc(collection(db, 'boardComments'), commentData);

      // Analytics: 댓글 작성 이벤트 로깅
      await logEvent('board_comment_created', {
        post_id: postId,
        comment_id: commentRef.id,
        is_anonymous: !!isAnonymous,
        is_reply: !!parentId,
        comment_length: content.trim().length,
      });

      // 게시글의 댓글 수 증가
      const postRef = doc(db, 'boardPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1),
        lastCommentAt: serverTimestamp(),
      });

    } catch (err: any) {
      console.error('댓글 작성 실패:', err);
      const errorMessage = err?.message || '댓글 작성에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [postId, user]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!user?.uid || !content.trim()) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    try {
      setSubmitting(true);
      setError(null);

      const commentRef = doc(db, 'boardComments', commentId);
      await updateDoc(commentRef, {
        content: content.trim(),
        updatedAt: serverTimestamp(),
      });

    } catch (err: any) {
      console.error('댓글 수정 실패:', err);
      const errorMessage = err?.message || '댓글 수정에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user?.uid) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setSubmitting(true);
      setError(null);

      const commentRef = doc(db, 'boardComments', commentId);
      await updateDoc(commentRef, {
        isDeleted: true,
        updatedAt: serverTimestamp(),
      });

      // 게시글의 댓글 수 감소
      const postRef = doc(db, 'boardPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(-1),
      });

    } catch (err: any) {
      console.error('댓글 삭제 실패:', err);
      const errorMessage = err?.message || '댓글 삭제에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [postId, user]);

  useEffect(() => {
    const unsubscribe = loadComments();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadComments]);

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
    addReply,
    updateComment,
    deleteComment,
  };
};
