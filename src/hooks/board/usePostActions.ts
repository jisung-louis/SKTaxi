// SKTaxi: 게시글 액션 훅 (Repository 패턴 적용)

import { useCallback, useState, useEffect } from 'react';
import { useBoardRepository } from '../../di/useRepository';
import { useAuth } from '../auth';
import { logEvent } from '../../lib/analytics';

export interface UsePostActionsResult {
  /** 좋아요 토글 (추가/취소) */
  toggleLike: () => Promise<boolean>;
  /** 북마크 토글 (추가/취소) */
  toggleBookmark: () => Promise<boolean>;
  /** 조회수 증가 */
  incrementViewCount: () => Promise<void>;
  /** 게시글 삭제 (soft delete) */
  deletePost: () => Promise<void>;
  /** 좋아요 상태 확인 */
  isLiked: boolean;
  /** 북마크 상태 확인 */
  isBookmarked: boolean;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
}

/**
 * 게시글 액션을 처리하는 훅 (Repository 패턴)
 * 좋아요, 조회수 증가, 삭제 등의 액션 제공
 */
export function usePostActions(postId: string): UsePostActionsResult {
  const { user } = useAuth();
  const boardRepository = useBoardRepository();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 좋아요 상태 확인 (컴포넌트에서 필요시 호출)
  const checkLikeStatus = useCallback(async () => {
    if (!user?.uid || !postId) return;

    try {
      const liked = await boardRepository.isLiked(postId, user.uid);
      setIsLiked(liked);
    } catch (err) {
      console.error('좋아요 상태 확인 실패:', err);
    }
  }, [postId, user?.uid, boardRepository]);

  // 북마크 상태 확인
  const checkBookmarkStatus = useCallback(async () => {
    if (!user?.uid || !postId) return;

    try {
      const bookmarked = await boardRepository.isBookmarked(postId, user.uid);
      setIsBookmarked(bookmarked);
    } catch (err) {
      console.error('북마크 상태 확인 실패:', err);
    }
  }, [postId, user?.uid, boardRepository]);

  // 마운트 시 좋아요/북마크 상태 확인
  useEffect(() => {
    checkLikeStatus();
    checkBookmarkStatus();
  }, [checkLikeStatus, checkBookmarkStatus]);

  const toggleLike = useCallback(async (): Promise<boolean> => {
    if (!user?.uid || !postId) {
      throw new Error('로그인이 필요합니다.');
    }

    // 낙관적 업데이트: 즉시 UI 반영
    const previousStatus = isLiked;
    const optimisticNewStatus = !isLiked;
    setIsLiked(optimisticNewStatus);

    try {
      setLoading(true);
      setError(null);

      const actualNewStatus = await boardRepository.toggleLike(postId, user.uid);

      // 서버 응답이 다르면 동기화
      if (actualNewStatus !== optimisticNewStatus) {
        setIsLiked(actualNewStatus);
      }

      // Analytics: 게시글 좋아요 이벤트 로깅
      if (actualNewStatus) {
        await logEvent('board_post_liked', {
          post_id: postId,
        });
      }

      return actualNewStatus;
    } catch (err) {
      // 에러 시 롤백
      setIsLiked(previousStatus);
      const message = err instanceof Error ? err.message : '좋아요에 실패했습니다.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [postId, user?.uid, boardRepository, isLiked]);

  const incrementViewCount = useCallback(async (): Promise<void> => {
    if (!postId) return;

    try {
      await boardRepository.incrementViewCount(postId);
    } catch (err) {
      console.error('조회수 증가 실패:', err);
      // 조회수 실패는 사용자에게 표시하지 않음
    }
  }, [postId, boardRepository]);

  const deletePost = useCallback(async (): Promise<void> => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);

      await boardRepository.deletePost(postId);
    } catch (err) {
      const message = err instanceof Error ? err.message : '게시글 삭제에 실패했습니다.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [postId, boardRepository]);

  const toggleBookmark = useCallback(async (): Promise<boolean> => {
    if (!user?.uid || !postId) {
      throw new Error('로그인이 필요합니다.');
    }

    // 낙관적 업데이트: 즉시 UI 반영
    const previousStatus = isBookmarked;
    const optimisticNewStatus = !isBookmarked;
    setIsBookmarked(optimisticNewStatus);

    try {
      setLoading(true);
      setError(null);

      const actualNewStatus = await boardRepository.toggleBookmark(postId, user.uid);

      // 서버 응답이 다르면 동기화
      if (actualNewStatus !== optimisticNewStatus) {
        setIsBookmarked(actualNewStatus);
      }

      // Analytics: 게시글 북마크 이벤트 로깅
      if (actualNewStatus) {
        await logEvent('board_post_bookmarked', {
          post_id: postId,
        });
      }

      return actualNewStatus;
    } catch (err) {
      // 에러 시 롤백
      setIsBookmarked(previousStatus);
      const message = err instanceof Error ? err.message : '북마크에 실패했습니다.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [postId, user?.uid, boardRepository, isBookmarked]);

  return {
    toggleLike,
    toggleBookmark,
    incrementViewCount,
    deletePost,
    isLiked,
    isBookmarked,
    loading,
    error,
  };
}
