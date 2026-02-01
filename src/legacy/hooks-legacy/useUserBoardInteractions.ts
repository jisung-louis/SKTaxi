/**
 * @deprecated 이 훅은 Firebase 직접 접근으로 DIP 원칙 위반.
 * 새로운 코드에서는 hooks/board/usePostActions 사용 권장.
 * import { usePostActions } from '../hooks/board';
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from '@react-native-firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from './useAuth';

interface UserBoardInteraction {
  userId: string;
  postId: string;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** @deprecated hooks/board/usePostActions 사용 권장 */
export const useUserBoardInteractions = (postId: string) => {
  const { user } = useAuth();
  const [interaction, setInteraction] = useState<UserBoardInteraction | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInteraction = useCallback(async () => {
    if (!user || !postId) {
      setLoading(false);
      return;
    }

    try {
      const interactionRef = doc(db, 'userBoardInteractions', `${user.uid}_${postId}`);
      const snapshot = await getDoc(interactionRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data) {
          setInteraction({
            userId: data.userId,
            postId: data.postId,
            isLiked: data.isLiked || false,
            isBookmarked: data.isBookmarked || false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        }
      } else {
        setInteraction({
          userId: user.uid,
          postId,
          isLiked: false,
          isBookmarked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error('사용자 상호작용 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [user, postId]);

  const updateInteraction = useCallback(async (updates: Partial<UserBoardInteraction>) => {
    if (!user || !postId) return;

    try {
      const interactionRef = doc(db, 'userBoardInteractions', `${user.uid}_${postId}`);
      const currentInteraction = interaction || {
        userId: user.uid,
        postId,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedInteraction = {
        ...currentInteraction,
        ...updates,
        updatedAt: new Date(),
      };

      await setDoc(interactionRef, updatedInteraction);
      setInteraction(updatedInteraction);
    } catch (err) {
      console.error('사용자 상호작용 업데이트 실패:', err);
      throw err;
    }
  }, [user, postId, interaction]);

  const toggleLike = useCallback(async () => {
    if (!interaction) return;

    try {
      await updateInteraction({ isLiked: !interaction.isLiked });
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      throw err;
    }
  }, [interaction, updateInteraction]);

  const toggleBookmark = useCallback(async () => {
    if (!interaction) return;

    try {
      await updateInteraction({ isBookmarked: !interaction.isBookmarked });
    } catch (err) {
      console.error('북마크 토글 실패:', err);
      throw err;
    }
  }, [interaction, updateInteraction]);

  useEffect(() => {
    loadInteraction();
  }, [loadInteraction]);

  // 실시간 구독
  useEffect(() => {
    if (!user || !postId) return;

    const interactionRef = doc(db, 'userBoardInteractions', `${user.uid}_${postId}`);
    const unsubscribe = onSnapshot(interactionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data) {
          setInteraction({
            userId: data.userId,
            postId: data.postId,
            isLiked: data.isLiked || false,
            isBookmarked: data.isBookmarked || false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        }
      } else {
        setInteraction({
          userId: user.uid,
          postId,
          isLiked: false,
          isBookmarked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      setLoading(false);
    }, (err) => {
      console.error('사용자 상호작용 구독 실패:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, postId]);

  return {
    interaction,
    loading,
    isLiked: interaction?.isLiked || false,
    isBookmarked: interaction?.isBookmarked || false,
    toggleLike,
    toggleBookmark,
  };
};
