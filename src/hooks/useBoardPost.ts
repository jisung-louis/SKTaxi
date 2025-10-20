import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, onSnapshot } from '@react-native-firebase/firestore';
import { BoardPost } from '../types/board';
import { db } from '../config/firebase';
import { usePostActions } from './usePostActions';
import { useUserBoardInteractions } from './useUserBoardInteractions';

export const useBoardPost = (postId: string) => {
  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 게시글 액션 훅 사용
  const postActions = usePostActions(postId);
  
  // 사용자별 상호작용 훅 사용
  const { isLiked, isBookmarked } = useUserBoardInteractions(postId);

  const loadPost = useCallback(async () => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);

      const postRef = doc(db, 'boardPosts', postId);
      const snapshot = await getDoc(postRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data) {
          setPost({
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastCommentAt: data.lastCommentAt?.toDate(),
          } as BoardPost);
        }
      } else {
        setError('게시글을 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('게시글 로드 실패:', err);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // 에러 처리가 포함된 래퍼 함수들
  const likePost = useCallback(async () => {
    try {
      await postActions.likePost();
    } catch (err) {
      setError(err instanceof Error ? err.message : '좋아요에 실패했습니다.');
    }
  }, [postActions]);

  const unlikePost = useCallback(async () => {
    try {
      await postActions.unlikePost();
    } catch (err) {
      setError(err instanceof Error ? err.message : '좋아요 취소에 실패했습니다.');
    }
  }, [postActions]);

  const bookmarkPost = useCallback(async () => {
    try {
      await postActions.bookmarkPost();
    } catch (err) {
      setError(err instanceof Error ? err.message : '북마크에 실패했습니다.');
    }
  }, [postActions]);

  const unbookmarkPost = useCallback(async () => {
    try {
      await postActions.unbookmarkPost();
    } catch (err) {
      setError(err instanceof Error ? err.message : '북마크 취소에 실패했습니다.');
    }
  }, [postActions]);

  const incrementViewCount = useCallback(async () => {
    try {
      await postActions.incrementViewCount();
    } catch (err) {
      console.error('조회수 증가 실패:', err);
    }
  }, [postActions]);

  const deletePost = useCallback(async () => {
    try {
      await postActions.deletePost();
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 삭제에 실패했습니다.');
    }
  }, [postActions]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  // 실시간 구독 (선택사항)
  useEffect(() => {
    if (!postId) return;

    const postRef = doc(db, 'boardPosts', postId);
    const unsubscribe = onSnapshot(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data) {
          setPost({
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastCommentAt: data.lastCommentAt?.toDate(),
          } as BoardPost);
        }
      }
    }, (err) => {
      console.error('게시글 실시간 구독 실패:', err);
    });

    return () => unsubscribe();
  }, [postId]);

  return {
    post,
    loading,
    error,
    isLiked,
    isBookmarked,
    likePost,
    unlikePost,
    bookmarkPost,
    unbookmarkPost,
    incrementViewCount,
    deletePost,
    refresh: loadPost,
  };
};
