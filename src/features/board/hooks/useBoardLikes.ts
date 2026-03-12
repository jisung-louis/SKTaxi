import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';
import { logEvent } from '@/lib/analytics';

import { useBoardRepository } from './useBoardRepository';

export interface UseBoardLikesResult {
  isLiked: boolean;
  loading: boolean;
  error: string | null;
  toggleLike: () => Promise<boolean>;
}

export function useBoardLikes(postId: string): UseBoardLikesResult {
  const { user } = useAuth();
  const boardRepository = useBoardRepository();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkLikeStatus = useCallback(async () => {
    if (!user?.uid || !postId) {
      setIsLiked(false);
      return;
    }

    try {
      const liked = await boardRepository.isLiked(postId, user.uid);
      setIsLiked(liked);
    } catch (err) {
      console.error('좋아요 상태 확인 실패:', err);
    }
  }, [boardRepository, postId, user?.uid]);

  useEffect(() => {
    void checkLikeStatus();
  }, [checkLikeStatus]);

  const toggleLike = useCallback(async () => {
    if (!user?.uid || !postId) {
      throw new Error('로그인이 필요합니다.');
    }

    const previousStatus = isLiked;
    const optimisticStatus = !isLiked;
    setIsLiked(optimisticStatus);

    try {
      setLoading(true);
      setError(null);

      const actualStatus = await boardRepository.toggleLike(postId, user.uid);
      if (actualStatus !== optimisticStatus) {
        setIsLiked(actualStatus);
      }

      if (actualStatus) {
        await logEvent('board_post_liked', { post_id: postId });
      }

      return actualStatus;
    } catch (err) {
      setIsLiked(previousStatus);
      const message = err instanceof Error ? err.message : '좋아요에 실패했습니다.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [boardRepository, isLiked, postId, user?.uid]);

  return {
    isLiked,
    loading,
    error,
    toggleLike,
  };
}
