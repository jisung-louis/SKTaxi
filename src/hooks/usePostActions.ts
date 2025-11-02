import { useCallback } from 'react';
import { doc, updateDoc, increment } from '@react-native-firebase/firestore';
import { db } from '../config/firebase';
import { useUserBoardInteractions } from './useUserBoardInteractions';
import { logEvent } from '../lib/analytics';

export const usePostActions = (postId: string) => {
  const { isLiked, isBookmarked, toggleLike, toggleBookmark } = useUserBoardInteractions(postId);

  const likePost = useCallback(async () => {
    if (!postId) return;

    try {
      // 현재 좋아요 상태가 false인 경우에만 처리
      if (!isLiked) {
        // 사용자 상호작용 업데이트
        await toggleLike();
        
        // 게시글의 좋아요 수 증가
        const postRef = doc(db, 'boardPosts', postId);
        await updateDoc(postRef, {
          likeCount: increment(1),
        });
        
        // Analytics: 게시글 좋아요 이벤트 로깅
        await logEvent('board_post_liked', {
          post_id: postId,
        });
      }
    } catch (err) {
      console.error('좋아요 실패:', err);
      throw new Error('좋아요에 실패했습니다.');
    }
  }, [postId, isLiked, toggleLike]);

  const unlikePost = useCallback(async () => {
    if (!postId) return;

    try {
      // 현재 좋아요 상태가 true인 경우에만 처리
      if (isLiked) {
        // 사용자 상호작용 업데이트
        await toggleLike();
        
        // 게시글의 좋아요 수 감소
        const postRef = doc(db, 'boardPosts', postId);
        await updateDoc(postRef, {
          likeCount: increment(-1),
        });
      }
    } catch (err) {
      console.error('좋아요 취소 실패:', err);
      throw new Error('좋아요 취소에 실패했습니다.');
    }
  }, [postId, isLiked, toggleLike]);

  const bookmarkPost = useCallback(async () => {
    if (!postId) return;

    try {
      // 현재 북마크 상태가 false인 경우에만 처리
      if (!isBookmarked) {
        // 사용자 상호작용 업데이트
        await toggleBookmark();
        
        // 게시글의 북마크 수 증가
        const postRef = doc(db, 'boardPosts', postId);
        await updateDoc(postRef, {
          bookmarkCount: increment(1),
        });
      }
    } catch (err) {
      console.error('북마크 실패:', err);
      throw new Error('북마크에 실패했습니다.');
    }
  }, [postId, isBookmarked, toggleBookmark]);

  const unbookmarkPost = useCallback(async () => {
    if (!postId) return;

    try {
      // 현재 북마크 상태가 true인 경우에만 처리
      if (isBookmarked) {
        // 사용자 상호작용 업데이트
        await toggleBookmark();
        
        // 게시글의 북마크 수 감소
        const postRef = doc(db, 'boardPosts', postId);
        await updateDoc(postRef, {
          bookmarkCount: increment(-1),
        });
      }
    } catch (err) {
      console.error('북마크 취소 실패:', err);
      throw new Error('북마크 취소에 실패했습니다.');
    }
  }, [postId, isBookmarked, toggleBookmark]);

  const incrementViewCount = useCallback(async () => {
    if (!postId) return;

    try {
      const postRef = doc(db, 'boardPosts', postId);
      await updateDoc(postRef, {
        viewCount: increment(1),
      });
    } catch (err) {
      console.error('조회수 증가 실패:', err);
      throw new Error('조회수 증가에 실패했습니다.');
    }
  }, [postId]);

  const deletePost = useCallback(async () => {
    if (!postId) return;

    try {
      const postRef = doc(db, 'boardPosts', postId);
      await updateDoc(postRef, {
        isDeleted: true,
        deletedAt: new Date(),
      });
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      throw new Error('게시글 삭제에 실패했습니다.');
    }
  }, [postId]);

  return {
    likePost,
    unlikePost,
    bookmarkPost,
    unbookmarkPost,
    incrementViewCount,
    deletePost,
  };
};
