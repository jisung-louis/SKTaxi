import { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/features/auth';

import { useNoticeRepository } from './useNoticeRepository';

export interface UseNoticeLikeResult {
  /** 좋아요 상태 */
  isLiked: boolean;
  /** 좋아요 개수 */
  likeCount: number;
  /** 로딩 상태 */
  loading: boolean;
  /** 좋아요 토글 */
  toggleLike: () => Promise<void>;
}

export function useNoticeLike(noticeId: string): UseNoticeLikeResult {
  const { user } = useAuth();
  const noticeRepository = useNoticeRepository();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!noticeId) {
      setLoading(false);
      return;
    }

    const unsubscribe = noticeRepository.subscribeToNotice(noticeId, {
      onData: (notice) => {
        if (notice) {
          setLikeCount(notice.likeCount || 0);
        }
      },
      onError: (error) => {
        console.error('공지사항 좋아요 수 구독 실패:', error);
      },
    });

    return () => unsubscribe();
  }, [noticeId, noticeRepository]);

  useEffect(() => {
    if (!noticeId || !user?.uid) {
      setLoading(false);
      return;
    }

    const checkLikeStatus = async () => {
      try {
        const liked = await noticeRepository.isLiked(noticeId, user.uid);
        setIsLiked(liked);
      } catch (error) {
        console.error('좋아요 상태 확인 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLikeStatus();
  }, [noticeId, user?.uid, noticeRepository]);

  const toggleLike = useCallback(async () => {
    if (!user?.uid || loading) {
      return;
    }

    try {
      setLoading(true);
      const newLikeStatus = await noticeRepository.toggleLike(noticeId, user.uid);
      setIsLiked(newLikeStatus);
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [noticeId, user?.uid, loading, noticeRepository]);

  return {
    isLiked,
    likeCount,
    loading,
    toggleLike,
  };
}
