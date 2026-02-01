// SKTaxi: 공지사항 좋아요 훅 (Repository 패턴 적용)

import { useState, useEffect, useCallback } from 'react';
import { useNoticeRepository } from '../../di/useRepository';
import { useAuth } from '../auth';

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

/**
 * 공지사항 좋아요를 관리하는 훅 (Repository 패턴)
 * 실시간 구독으로 좋아요 상태 및 개수 감지
 */
export function useNoticeLike(noticeId: string): UseNoticeLikeResult {
  const { user } = useAuth();
  const noticeRepository = useNoticeRepository();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 공지사항 실시간 구독 (좋아요 수)
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

  // 좋아요 상태 확인
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

  // 좋아요 토글
  const toggleLike = useCallback(async () => {
    if (!user?.uid || loading) return;

    try {
      setLoading(true);
      const newLikeStatus = await noticeRepository.toggleLike(noticeId, user.uid);
      setIsLiked(newLikeStatus);
      // likeCount는 subscribeToNotice에서 자동 업데이트됨
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
