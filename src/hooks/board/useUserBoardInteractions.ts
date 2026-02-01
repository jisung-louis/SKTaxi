// SKTaxi: 게시물 사용자 상호작용 훅 - Repository 패턴 적용
// IBoardRepository를 사용하여 Firebase Firestore 직접 의존 제거

import { useState, useEffect, useCallback } from 'react';
import { useRepository } from '../../di';
import { useAuth } from '../auth';

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

export const useUserBoardInteractions = (postId: string): UseUserBoardInteractionsResult => {
  const { user } = useAuth();
  const { boardRepository, userRepository } = useRepository();
  
  const [interaction, setInteraction] = useState<UserBoardInteraction | null>(null);
  const [loading, setLoading] = useState(true);

  // 상호작용 로드 및 실시간 구독
  useEffect(() => {
    if (!user?.uid || !postId) {
      setInteraction(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 초기 상태 설정
    setInteraction({
      userId: user.uid,
      postId,
      isLiked: false,
      isBookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 좋아요 상태 로드 (boardRepository 사용)
    const loadLikeStatus = async () => {
      try {
        // boardRepository에 getUserPostInteraction이 있다면 사용
        // 없다면 별도 로직 필요
        setLoading(false);
      } catch (err) {
        console.error('상호작용 로드 실패:', err);
        setLoading(false);
      }
    };

    loadLikeStatus();

    // 북마크 상태 구독
    const unsubscribeBookmarks = userRepository.subscribeToBookmarks(user.uid, {
      onData: (bookmarks) => {
        setInteraction((prev) => prev ? {
          ...prev,
          isBookmarked: bookmarks.includes(postId),
          updatedAt: new Date(),
        } : null);
      },
      onError: (err) => {
        console.error('북마크 구독 실패:', err);
      },
    });

    return () => {
      unsubscribeBookmarks();
    };
  }, [user?.uid, postId, boardRepository, userRepository]);

  const toggleLike = useCallback(async () => {
    if (!user?.uid || !postId || !interaction) return;

    try {
      const previousIsLiked = interaction.isLiked;
      
      // 낙관적 업데이트
      setInteraction((prev) => prev ? {
        ...prev,
        isLiked: !prev.isLiked,
        updatedAt: new Date(),
      } : null);

      // Repository를 통해 좋아요 토글
      await boardRepository.toggleLike(postId, user.uid);
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      // 롤백
      setInteraction((prev) => prev ? {
        ...prev,
        isLiked: !prev.isLiked,
        updatedAt: new Date(),
      } : null);
      throw err;
    }
  }, [user?.uid, postId, interaction, boardRepository]);

  const toggleBookmark = useCallback(async () => {
    if (!user?.uid || !postId || !interaction) return;

    try {
      const newIsBookmarked = !interaction.isBookmarked;
      
      // 낙관적 업데이트
      setInteraction((prev) => prev ? {
        ...prev,
        isBookmarked: newIsBookmarked,
        updatedAt: new Date(),
      } : null);

      // Repository를 통해 북마크 토글
      if (newIsBookmarked) {
        await userRepository.addBookmark(user.uid, postId);
      } else {
        await userRepository.removeBookmark(user.uid, postId);
      }
    } catch (err) {
      console.error('북마크 토글 실패:', err);
      // 롤백
      setInteraction((prev) => prev ? {
        ...prev,
        isBookmarked: !prev.isBookmarked,
        updatedAt: new Date(),
      } : null);
      throw err;
    }
  }, [user?.uid, postId, interaction, userRepository]);

  return {
    interaction,
    loading,
    isLiked: interaction?.isLiked || false,
    isBookmarked: interaction?.isBookmarked || false,
    toggleLike,
    toggleBookmark,
  };
};
