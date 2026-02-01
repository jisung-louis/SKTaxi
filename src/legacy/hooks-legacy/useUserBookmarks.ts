import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc,
  getDocs
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from './useAuth';

export const useUserBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(() => {
    if (!user?.uid) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookmarksRef = collection(db, 'userBookmarks');
      const q = query(
        bookmarksRef,
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const bookmarkIds: string[] = [];
        snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const data: any = docSnap.data();
          if (data.postId) {
            bookmarkIds.push(data.postId);
          }
        });
        setBookmarks(bookmarkIds);
        setLoading(false);
      }, (err) => {
        console.error('북마크 구독 실패:', err);
        setError('북마크를 불러오는데 실패했습니다.');
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error('북마크 로드 실패:', err);
      setError('북마크를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  }, [user?.uid]);

  const addBookmark = useCallback(async (postId: string) => {
    if (!user?.uid) return;

    try {
      const bookmarkData = {
        userId: user.uid,
        postId,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'userBookmarks'), bookmarkData);
    } catch (err) {
      console.error('북마크 추가 실패:', err);
      setError('북마크 추가에 실패했습니다.');
    }
  }, [user?.uid]);

  const removeBookmark = useCallback(async (postId: string) => {
    if (!user?.uid) return;

    try {
      const bookmarksRef = collection(db, 'userBookmarks');
      const q = query(
        bookmarksRef,
        where('userId', '==', user.uid),
        where('postId', '==', postId)
      );

      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        deleteDoc(docSnap.ref);
      });
    } catch (err) {
      console.error('북마크 제거 실패:', err);
      setError('북마크 제거에 실패했습니다.');
    }
  }, [user?.uid]);

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

  useEffect(() => {
    const unsubscribe = loadBookmarks();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadBookmarks]);

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
