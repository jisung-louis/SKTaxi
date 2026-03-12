import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';
import { logEvent } from '@/lib/analytics';

import { useBoardRepository } from './useBoardRepository';

export interface UseBoardBookmarksResult {
  isBookmarked: boolean;
  loading: boolean;
  error: string | null;
  toggleBookmark: () => Promise<boolean>;
}

export function useBoardBookmarks(postId: string): UseBoardBookmarksResult {
  const { user } = useAuth();
  const boardRepository = useBoardRepository();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBookmarkStatus = useCallback(async () => {
    if (!user?.uid || !postId) {
      setIsBookmarked(false);
      return;
    }

    try {
      const bookmarked = await boardRepository.isBookmarked(postId, user.uid);
      setIsBookmarked(bookmarked);
    } catch (err) {
      console.error('북마크 상태 확인 실패:', err);
    }
  }, [boardRepository, postId, user?.uid]);

  useEffect(() => {
    void checkBookmarkStatus();
  }, [checkBookmarkStatus]);

  const toggleBookmark = useCallback(async () => {
    if (!user?.uid || !postId) {
      throw new Error('로그인이 필요합니다.');
    }

    const previousStatus = isBookmarked;
    const optimisticStatus = !isBookmarked;
    setIsBookmarked(optimisticStatus);

    try {
      setLoading(true);
      setError(null);

      const actualStatus = await boardRepository.toggleBookmark(postId, user.uid);
      if (actualStatus !== optimisticStatus) {
        setIsBookmarked(actualStatus);
      }

      if (actualStatus) {
        await logEvent('board_post_bookmarked', { post_id: postId });
      }

      return actualStatus;
    } catch (err) {
      setIsBookmarked(previousStatus);
      const message = err instanceof Error ? err.message : '북마크에 실패했습니다.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [boardRepository, isBookmarked, postId, user?.uid]);

  return {
    isBookmarked,
    loading,
    error,
    toggleBookmark,
  };
}
