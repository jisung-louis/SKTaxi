import { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  where,
  increment
} from '@react-native-firebase/firestore';
import { useAuth } from './useAuth';
import { Comment, CommentFormData } from '../types/comment';

export const useNoticeComments = (noticeId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = getFirestore();

  // 댓글 목록 실시간 구독
  useEffect(() => {
    if (!noticeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('noticeId', '==', noticeId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const commentsData: Comment[] = [];
        const repliesMap: { [key: string]: Comment[] } = {};
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const comment = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
          } as Comment;
          
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
        
        // 익명 댓글 순서 계산
        const anonymousOrderMap: { [key: string]: number } = {};
        let anonymousCounter = 1;
        
        // 댓글과 대댓글을 시간순으로 정렬하여 익명 순서 계산
        const allComments = [...commentsData];
        commentsData.forEach(comment => {
          const replies = repliesMap[comment.id] || [];
          allComments.push(...replies);
        });
        
        allComments
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .forEach(comment => {
            if (comment.isAnonymous) {
              const anonKey = `${comment.noticeId}:${comment.userId}`;
              if (!anonymousOrderMap[anonKey]) {
                anonymousOrderMap[anonKey] = anonymousCounter++;
              }
            }
          });

        // 댓글에 대댓글 추가 (대댓글에도 익명 순서 적용)
        const commentsWithReplies = commentsData.map(comment => ({
          ...comment,
          replies: (repliesMap[comment.id] || []).map(reply => ({
            ...reply,
            anonymousOrder: reply.isAnonymous ? anonymousOrderMap[`${reply.noticeId}:${reply.userId}`] : undefined
          })),
          anonymousOrder: comment.isAnonymous ? anonymousOrderMap[`${comment.noticeId}:${comment.userId}`] : undefined
        }));
        
        setComments(commentsWithReplies);
        setLoading(false);
      },
      (error) => {
        console.error('댓글 구독 실패:', error);
        setError('댓글을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [noticeId]);

  // 댓글 작성
  const addComment = async (formData: CommentFormData) => {
    if (!user?.uid || !formData.content.trim()) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    try {
      setSubmitting(true);
      setError(null);

      const commentsRef = collection(db, 'comments');
      const isAnonymous = formData.isAnonymous ?? true; // 기본값 true
      const anonId = isAnonymous ? `${noticeId}:${user.uid}` : undefined;
      
      const newComment = {
        noticeId,
        userId: user.uid,
        userDisplayName: user.displayName || '익명',
        content: formData.content.trim(),
        createdAt: new Date(),
        isDeleted: false,
        parentId: formData.parentId || null,
        replyCount: 0,
        isAnonymous,
        anonId,
      };

      await addDoc(commentsRef, newComment);

      // 공지사항의 댓글 수 업데이트
      const noticeRef = doc(db, 'notices', noticeId);
      await updateDoc(noticeRef, {
        commentCount: increment(1)
      });

    } catch (error: any) {
      console.error('댓글 작성 실패:', error);
      setError(error.message || '댓글 작성에 실패했습니다.');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글 수정
  const updateComment = async (commentId: string, content: string) => {
    if (!user?.uid || !content.trim()) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    try {
      setSubmitting(true);
      setError(null);

      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        content: content.trim(),
        updatedAt: new Date(),
      });

    } catch (error: any) {
      console.error('댓글 수정 실패:', error);
      setError(error.message || '댓글 수정에 실패했습니다.');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글 삭제 (soft delete)
  const deleteComment = async (commentId: string) => {
    if (!user?.uid) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setSubmitting(true);
      setError(null);

      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        isDeleted: true,
        content: '[삭제된 댓글입니다]',
        updatedAt: new Date(),
      });

      // 공지사항의 댓글 수 업데이트
      const noticeRef = doc(db, 'notices', noticeId);
      await updateDoc(noticeRef, {
        commentCount: increment(-1)
      });

    } catch (error: any) {
      console.error('댓글 삭제 실패:', error);
      setError(error.message || '댓글 삭제에 실패했습니다.');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // 대댓글 작성
  const addReply = async (parentId: string, content: string, isAnonymous?: boolean) => {
    return addComment({ content, parentId, isAnonymous });
  };

  return {
    comments,
    loading,
    submitting,
    error,
    addComment,
    updateComment,
    deleteComment,
    addReply,
  };
};
