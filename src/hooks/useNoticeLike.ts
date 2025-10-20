import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot, setDoc, deleteDoc, updateDoc, increment } from '@react-native-firebase/firestore';
import { useAuth } from './useAuth';

export const useNoticeLike = (noticeId: string) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  // 실시간 좋아요 상태와 개수 구독
  useEffect(() => {
    if (!noticeId || !user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 공지사항 문서의 좋아요 수 실시간 구독
    const noticeUnsubscribe = onSnapshot(
      doc(db, 'notices', noticeId),
      (noticeDoc) => {
        if (noticeDoc.exists()) {
          const data = noticeDoc.data();
          setLikeCount(data?.likeCount || 0);
        }
      },
      (error) => {
        console.error('공지사항 좋아요 수 구독 실패:', error);
        setLoading(false);
      }
    );

    // 현재 사용자의 좋아요 상태 실시간 구독
    const likeUnsubscribe = onSnapshot(
      doc(db, 'notices', noticeId, 'likes', user.uid),
      (likeDoc) => {
        setIsLiked(likeDoc.exists());
        setLoading(false);
      },
      (error) => {
        console.error('사용자 좋아요 상태 구독 실패:', error);
        setLoading(false);
      }
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      noticeUnsubscribe();
      likeUnsubscribe();
    };
  }, [noticeId, user?.uid]);

  // 좋아요 토글
  const toggleLike = async () => {
    if (!user?.uid || loading) return;

    try {
      setLoading(true);
      const likeRef = doc(db, 'notices', noticeId, 'likes', user.uid);
      const noticeRef = doc(db, 'notices', noticeId);

      if (isLiked) {
        // 좋아요 취소
        await deleteDoc(likeRef);
        await updateDoc(noticeRef, {
          likeCount: increment(-1)
        });
        // 로컬 상태 업데이트 제거 - 실시간 구독에서 처리
      } else {
        // 좋아요 추가
        await setDoc(likeRef, {
          userId: user.uid,
          createdAt: new Date()
        });
        await updateDoc(noticeRef, {
          likeCount: increment(1)
        });
        // 로컬 상태 업데이트 제거 - 실시간 구독에서 처리
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    loading,
    toggleLike
  };
};
