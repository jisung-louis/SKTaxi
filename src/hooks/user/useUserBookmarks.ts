// SKTaxi: useUserBookmarks 훅 - Repository 패턴 적용
// IUserRepository를 사용하여 Firebase Firestore 직접 의존 제거

import { useState, useEffect, useCallback } from 'react';
import { useRepository } from '../../di';
import { useAuth } from '../auth';

export interface UseUserBookmarksResult {
  bookmarks: string[];
  loading: boolean;
  error: string | null;
  addBookmark: (postId: string) => Promise<void>;
  removeBookmark: (postId: string) => Promise<void>;
  isBookmarked: (postId: string) => boolean;
  toggleBookmark: (postId: string) => Promise<void>;
}

export const useUserBookmarks = (): UseUserBookmarksResult => {
  const { user } = useAuth();
  const { userRepository } = useRepository();
  
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 북마크 실시간 구독
  useEffect(() => {
    if (!user?.uid) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = userRepository.subscribeToBookmarks(user.uid, {
      onData: (bookmarkIds) => {
        setBookmarks(bookmarkIds);
        setLoading(false);
      },
      onError: (err) => {
        console.error('북마크 구독 실패:', err);
        setError('북마크를 불러오는데 실패했습니다.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [user?.uid, userRepository]);

  const addBookmark = useCallback(async (postId: string) => {
    if (!user?.uid) return;

    try {
      await userRepository.addBookmark(user.uid, postId);
    } catch (err) {
      console.error('북마크 추가 실패:', err);
      setError('북마크 추가에 실패했습니다.');
    }
  }, [user?.uid, userRepository]);

  const removeBookmark = useCallback(async (postId: string) => {
    if (!user?.uid) return;

    try {
      await userRepository.removeBookmark(user.uid, postId);
    } catch (err) {
      console.error('북마크 제거 실패:', err);
      setError('북마크 제거에 실패했습니다.');
    }
  }, [user?.uid, userRepository]);

  const isBookmarked = useCallback((postId: string) => {
    return bookmarks.includes(postId);
  }, [bookmarks]);

  const toggleBookmark = useCallback(async (postId: string) => {
    if (isBookmarked(postId)) {
      await removeBookmark(postId);
    } else {
      await addBookmark(postId);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  };
};
