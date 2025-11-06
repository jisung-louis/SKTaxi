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
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { logEvent } from '../lib/analytics';

export type CommentType = 'board' | 'notice';

interface BaseComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  parentId?: string;
  isAnonymous?: boolean;
  anonId?: string;
  anonymousOrder?: number;
  replies?: BaseComment[];
}

interface BoardComment extends BaseComment {
  postId: string;
  authorId: string;
  authorName: string;
  authorProfileImage?: string;
}

interface NoticeComment extends BaseComment {
  noticeId: string;
  userId: string;
  userDisplayName: string;
}

type Comment = BoardComment | NoticeComment;

export const useComments = (type: CommentType, targetId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<(Comment & { replies: Comment[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 컬렉션명과 필드명 결정
  const collectionName = type === 'board' ? 'boardComments' : 'noticeComments';
  const targetField = type === 'board' ? 'postId' : 'noticeId';
  const parentCollection = type === 'board' ? 'boardPosts' : 'notices';
  const countField = 'commentCount';

  const loadComments = useCallback(() => {
    if (!targetId) return;

    try {
      setLoading(true);
      setError(null);

      const commentsRef = collection(db, collectionName);
      const q = query(
        commentsRef,
        where(targetField, '==', targetId),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const commentsData: Comment[] = [];
        const repliesMap: { [key: string]: Comment[] } = {};
        
        snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const data: any = docSnap.data();
          const comment = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
          } as Comment;
          
          // 대댓글도 삭제 여부와 관계없이 repliesMap에 포함시켜 트리 구조를 유지한다
          if (comment.parentId) {
            if (!repliesMap[comment.parentId]) {
              repliesMap[comment.parentId] = [];
            }
            repliesMap[comment.parentId].push(comment);
          } else {
            // 댓글인 경우 - 삭제 여부와 관계없이 모두 포함 (답글이 있으면 표시해야 함)
            commentsData.push(comment);
          }
        });
        
        // 익명 댓글 순서 계산 - 모든 댓글(답글의 답글 포함)을 재귀적으로 수집
        const anonymousOrderMap: { [key: string]: number } = {};
        let anonymousCounter = 1;
        
        // 모든 댓글을 재귀적으로 수집하는 함수
        const collectAllComments = (commentList: Comment[]): Comment[] => {
          const all: Comment[] = [];
          commentList.forEach(comment => {
            all.push(comment);
            const replies = repliesMap[comment.id] || [];
            if (replies.length > 0) {
              all.push(...collectAllComments(replies));
            }
          });
          return all;
        };
        
        // 모든 댓글 수집 (답글의 답글 포함)
        const allComments = collectAllComments(commentsData);
        
        allComments
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .forEach(comment => {
            if (comment.isAnonymous) {
              const anonKey = type === 'board' 
                ? `${(comment as BoardComment).postId}:${(comment as BoardComment).authorId}`
                : `${(comment as NoticeComment).noticeId}:${(comment as NoticeComment).userId}`;
              if (!anonymousOrderMap[anonKey]) {
                anonymousOrderMap[anonKey] = anonymousCounter++;
              }
            }
          });

        // 재귀적으로 답글 구조 생성 (답글의 답글도 지원)
        const buildReplies = (parentId: string): Comment[] => {
          const directReplies = repliesMap[parentId] || [];
          return directReplies.map(reply => {
            const replyAnonKey = type === 'board'
              ? `${(reply as BoardComment).postId}:${(reply as BoardComment).authorId}`
              : `${(reply as NoticeComment).noticeId}:${(reply as NoticeComment).userId}`;
            return {
              ...reply,
              replies: buildReplies(reply.id), // 재귀적으로 답글의 답글도 가져오기
              anonymousOrder: reply.isAnonymous ? anonymousOrderMap[replyAnonKey] : undefined
            };
          });
        };

        // 댓글에 대댓글 추가 (대댓글에도 익명 순서 적용)
        const commentsWithReplies = commentsData.map(comment => {
          const anonKey = type === 'board'
            ? `${(comment as BoardComment).postId}:${(comment as BoardComment).authorId}`
            : `${(comment as NoticeComment).noticeId}:${(comment as NoticeComment).userId}`;
          
          return {
            ...comment,
            replies: buildReplies(comment.id),
            anonymousOrder: comment.isAnonymous ? anonymousOrderMap[anonKey] : undefined
          };
        });
        
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
  }, [targetId, type, collectionName, targetField]);

  const addComment = useCallback(async (content: string, parentId?: string, isAnonymous?: boolean) => {
    if (!targetId || !user || !content.trim()) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    try {
      setSubmitting(true);
      setError(null);

      const isAnon = !!isAnonymous;
      const commentData: any = {
        [targetField]: targetId,
        content: content.trim(),
        isAnonymous: isAnon,
        parentId: parentId || null,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (type === 'board') {
        commentData.authorId = user.uid;
        commentData.authorName = user.displayName || '익명';
        commentData.authorProfileImage = user.photoURL || null;
      } else {
        commentData.userId = user.uid;
        commentData.userDisplayName = user.displayName || '익명';
      }

      // 익명 댓글이면 anonId 추가
      if (isAnon) {
        commentData.anonId = `${targetId}:${user.uid}`;
      }

      const commentRef = await addDoc(collection(db, collectionName), commentData);

      // Analytics: 게시판 댓글만 로깅
      if (type === 'board') {
        await logEvent('board_comment_created', {
          post_id: targetId,
          comment_id: commentRef.id,
          is_anonymous: isAnon,
          is_reply: !!parentId,
          comment_length: content.trim().length,
        });
      }

      // 부모 문서의 댓글 수 증가
      const parentRef = doc(db, parentCollection, targetId);
      await updateDoc(parentRef, {
        [countField]: increment(1),
        ...(type === 'board' && { lastCommentAt: serverTimestamp() }),
      });

    } catch (err: any) {
      console.error('댓글 작성 실패:', err);
      const errorMessage = err?.message || '댓글 작성에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [targetId, user, type, collectionName, targetField, parentCollection, countField]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!user?.uid || !content.trim()) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    try {
      setSubmitting(true);
      setError(null);

      const commentRef = doc(db, collectionName, commentId);
      await updateDoc(commentRef, {
        content: content.trim(),
        updatedAt: serverTimestamp(),
      });

    } catch (err: any) {
      console.error('댓글 수정 실패:', err);
      const errorMessage = err?.message || '댓글 수정에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [user, collectionName]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user?.uid) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setSubmitting(true);
      setError(null);

      const commentRef = doc(db, collectionName, commentId);
      await updateDoc(commentRef, {
        isDeleted: true,
        content: '[삭제된 댓글입니다]',
        updatedAt: serverTimestamp(),
      });

      // 부모 문서의 댓글 수 감소
      const parentRef = doc(db, parentCollection, targetId);
      await updateDoc(parentRef, {
        [countField]: increment(-1),
      });

    } catch (err: any) {
      console.error('댓글 삭제 실패:', err);
      const errorMessage = err?.message || '댓글 삭제에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [targetId, user, collectionName, parentCollection, countField]);

  // 대댓글 작성
  const addReply = useCallback(async (parentId: string, content: string, isAnonymous?: boolean) => {
    return addComment(content, parentId, isAnonymous);
  }, [addComment]);

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
    addReply,
    updateComment,
    deleteComment,
  };
};

