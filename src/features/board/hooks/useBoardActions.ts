import { useCallback, useState } from 'react';

import { useBoardBookmarks } from './useBoardBookmarks';
import { useBoardLikes } from './useBoardLikes';
import { useBoardRepository } from './useBoardRepository';

export interface UseBoardActionsResult {
  toggleLike: () => Promise<boolean>;
  toggleBookmark: () => Promise<boolean>;
  incrementViewCount: () => Promise<void>;
  deletePost: () => Promise<void>;
  isLiked: boolean;
  isBookmarked: boolean;
  loading: boolean;
  error: string | null;
}

export type UsePostActionsResult = UseBoardActionsResult;

export function useBoardActions(postId: string): UseBoardActionsResult {
  const boardRepository = useBoardRepository();
  const likes = useBoardLikes(postId);
  const bookmarks = useBoardBookmarks(postId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const incrementViewCount = useCallback(async () => {
    if (!postId) {
      return;
    }

    try {
      await boardRepository.incrementViewCount(postId);
    } catch (err) {
      console.error('조회수 증가 실패:', err);
    }
  }, [boardRepository, postId]);

  const deletePost = useCallback(async () => {
    if (!postId) {
      return;
    }

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
  }, [boardRepository, postId]);

  return {
    toggleLike: likes.toggleLike,
    toggleBookmark: bookmarks.toggleBookmark,
    incrementViewCount,
    deletePost,
    isLiked: likes.isLiked,
    isBookmarked: bookmarks.isBookmarked,
    loading: loading || likes.loading || bookmarks.loading,
    error: error || likes.error || bookmarks.error,
  };
}

export const usePostActions = useBoardActions;
