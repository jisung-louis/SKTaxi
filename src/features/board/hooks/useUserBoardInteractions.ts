import { useCallback, useEffect, useState } from 'react';

import { useRepository } from '@/di';
import { useAuth } from '@/features/auth';

interface UserBoardInteraction {
  userId: string;
  postId: string;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UseUserBoardInteractionsResult {
  interaction: UserBoardInteraction | null;
  loading: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  toggleLike: () => Promise<void>;
  toggleBookmark: () => Promise<void>;
}

export const useUserBoardInteractions = (
  postId: string,
): UseUserBoardInteractionsResult => {
  const { user } = useAuth();
  const { boardRepository, userRepository } = useRepository();

  const [interaction, setInteraction] = useState<UserBoardInteraction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !postId) {
      setInteraction(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setInteraction({
      userId: user.uid,
      postId,
      isLiked: false,
      isBookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const unsubscribeBookmarks = userRepository.subscribeToBookmarks(user.uid, {
      onData: (bookmarks) => {
        setInteraction((prev) =>
          prev
            ? {
                ...prev,
                isBookmarked: bookmarks.includes(postId),
                updatedAt: new Date(),
              }
            : null,
        );
        setLoading(false);
      },
      onError: (err) => {
        console.error('북마크 구독 실패:', err);
        setLoading(false);
      },
    });

    return () => unsubscribeBookmarks();
  }, [boardRepository, postId, user?.uid, userRepository]);

  const toggleLike = useCallback(async () => {
    if (!user?.uid || !postId || !interaction) {
      return;
    }

    setInteraction((prev) =>
      prev
        ? {
            ...prev,
            isLiked: !prev.isLiked,
            updatedAt: new Date(),
          }
        : null,
    );

    try {
      await boardRepository.toggleLike(postId, user.uid);
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      setInteraction((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              updatedAt: new Date(),
            }
          : null,
      );
      throw err;
    }
  }, [boardRepository, interaction, postId, user?.uid]);

  const toggleBookmark = useCallback(async () => {
    if (!user?.uid || !postId || !interaction) {
      return;
    }

    const nextBookmarked = !interaction.isBookmarked;
    setInteraction((prev) =>
      prev
        ? {
            ...prev,
            isBookmarked: nextBookmarked,
            updatedAt: new Date(),
          }
        : null,
    );

    try {
      if (nextBookmarked) {
        await userRepository.addBookmark(user.uid, postId);
      } else {
        await userRepository.removeBookmark(user.uid, postId);
      }
    } catch (err) {
      console.error('북마크 토글 실패:', err);
      setInteraction((prev) =>
        prev
          ? {
              ...prev,
              isBookmarked: !prev.isBookmarked,
              updatedAt: new Date(),
            }
          : null,
      );
      throw err;
    }
  }, [interaction, postId, user?.uid, userRepository]);

  return {
    interaction,
    loading,
    isLiked: interaction?.isLiked || false,
    isBookmarked: interaction?.isBookmarked || false,
    toggleLike,
    toggleBookmark,
  };
};
