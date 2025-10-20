import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  increment,
  serverTimestamp
} from '@react-native-firebase/firestore';
import { BoardComment } from '../types/board';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useBoardComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<(BoardComment & { replies: BoardComment[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(() => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);

      const commentsRef = collection(db, 'boardComments');
      const q = query(
        commentsRef,
        where('postId', '==', postId),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData: BoardComment[] = [];
        const repliesMap: { [key: string]: BoardComment[] } = {};
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const comment = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as BoardComment;
          
          if (comment.parentId) {
            // 대댓글인 경우
            if (!repliesMap[comment.parentId]) {
              repliesMap[comment.parentId] = [];
            }
            repliesMap[comment.parentId].push(comment);
          } else {
            // 댓글인 경우
            commentsData.push(comment);
          }
        });
        
        // 댓글에 대댓글 추가
        const commentsWithReplies = commentsData.map(comment => ({
          ...comment,
          replies: repliesMap[comment.id] || []
        }));
        
        setComments(commentsWithReplies);
        setLoading(false);
      }, (err) => {
        console.error('댓글 구독 실패:', err);
        setError('댓글을 불러오는데 실패했습니다.');
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error('댓글 로드 실패:', err);
      setError('댓글을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content: string, parentId?: string) => {
    if (!postId || !user || !content.trim()) return;

    try {
      setSubmitting(true);

      const commentData = {
        postId,
        content: content.trim(),
        authorId: user.uid,
        authorName: user.displayName || '익명',
        authorProfileImage: user.photoURL || null,
        parentId: parentId || null,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'boardComments'), commentData);

      // 게시글의 댓글 수 증가
      const postRef = doc(db, 'boardPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1),
        lastCommentAt: serverTimestamp(),
      });

    } catch (err) {
      console.error('댓글 작성 실패:', err);
      setError('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [postId, user]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      setSubmitting(true);

      const commentRef = doc(db, 'boardComments', commentId);
      await updateDoc(commentRef, {
        content: content.trim(),
        updatedAt: serverTimestamp(),
      });

    } catch (err) {
      console.error('댓글 수정 실패:', err);
      setError('댓글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      setSubmitting(true);

      const commentRef = doc(db, 'boardComments', commentId);
      await updateDoc(commentRef, {
        isDeleted: true,
        updatedAt: serverTimestamp(),
      });

      // 게시글의 댓글 수 감소
      const postRef = doc(db, 'boardPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(-1),
      });

    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      setError('댓글 삭제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [postId]);

  useEffect(() => {
    const unsubscribe = loadComments();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadComments]);

  return {
    comments,
    loading,
    submitting,
    error,
    addComment,
    updateComment,
    deleteComment,
  };
};
