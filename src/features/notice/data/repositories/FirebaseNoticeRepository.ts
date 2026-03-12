import firestore, {
  collection,
  collectionGroup,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  writeBatch,
  where,
  limit,
  startAfter,
  increment,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import type { PaginatedResult } from '@/shared/types/pagination';
import type { SubscriptionCallbacks, Unsubscribe } from '@/features/taxi';

import {
  Comment,
  CommentFormData,
  INoticeRepository,
  Notice,
  NoticeCommentTreeNode,
  ReadStatusMap,
} from './INoticeRepository';

export class FirebaseNoticeRepository implements INoticeRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly noticesCollection = 'notices';
  private readonly commentsCollection = 'noticeComments';

  constructor() {
    this.db = firestore(getApp());
  }

  async getRecentNotices(noticeLimit: number): Promise<Notice[]> {
    const noticesRef = collection(this.db, this.noticesCollection);
    const q = query(noticesRef, orderBy('postedAt', 'desc'), limit(noticeLimit));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
      this.mapDocToNotice(docSnap)
    );
  }

  subscribeToNotices(
    category: string,
    noticeLimit: number,
    callbacks: SubscriptionCallbacks<Notice[]>
  ): Unsubscribe {
    const noticesRef = collection(this.db, this.noticesCollection);

    const q =
      category === '전체'
        ? query(noticesRef, orderBy('postedAt', 'desc'), limit(noticeLimit))
        : query(
            noticesRef,
            where('category', '==', category),
            orderBy('postedAt', 'desc'),
            limit(noticeLimit)
          );

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const notices: Notice[] = snapshot.docs.map(
          (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
            this.mapDocToNotice(docSnap),
        );
        callbacks.onData(notices);
      },
      (error) => callbacks.onError(error as Error),
    );
  }

  async getMoreNotices(
    category: string,
    cursor: unknown,
    noticeLimit: number
  ): Promise<PaginatedResult<Notice>> {
    const cursorDoc = cursor as FirebaseFirestoreTypes.QueryDocumentSnapshot;
    if (!cursorDoc) {
      return { data: [], hasMore: false, cursor: null };
    }

    const noticesRef = collection(this.db, this.noticesCollection);

    const q =
      category === '전체'
        ? query(
            noticesRef,
            orderBy('postedAt', 'desc'),
            startAfter(cursorDoc),
            limit(noticeLimit)
          )
        : query(
            noticesRef,
            where('category', '==', category),
            orderBy('postedAt', 'desc'),
            startAfter(cursorDoc),
            limit(noticeLimit)
          );

    const snapshot = await getDocs(q);

    const notices: Notice[] = snapshot.docs.map(
      (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        this.mapDocToNotice(docSnap),
    );

    return {
      data: notices,
      hasMore: snapshot.docs.length === noticeLimit,
      cursor: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  }

  async getNotice(noticeId: string): Promise<Notice | null> {
    const docRef = doc(this.db, this.noticesCollection, noticeId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return this.mapDocToNotice(snapshot);
    }

    return null;
  }

  subscribeToNotice(
    noticeId: string,
    callbacks: SubscriptionCallbacks<Notice | null>
  ): Unsubscribe {
    const docRef = doc(this.db, this.noticesCollection, noticeId);

    return onSnapshot(
      docRef,
      (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
        if (snapshot.exists()) {
          callbacks.onData(this.mapDocToNotice(snapshot));
        } else {
          callbacks.onData(null);
        }
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async getReadStatus(userId: string, noticeIds: string[]): Promise<ReadStatusMap> {
    if (noticeIds.length === 0) {return {};}

    const result: ReadStatusMap = {};

    const chunks: string[][] = [];
    for (let i = 0; i < noticeIds.length; i += 10) {
      chunks.push(noticeIds.slice(i, i + 10));
    }

    for (const ids of chunks) {
      try {
        const q = query(
          collectionGroup(this.db, 'readBy'),
          where('userId', '==', userId),
          where('noticeId', 'in', ids)
        );
        const snapshot = await getDocs(q);

        snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const data = docSnap.data();
          if (data?.noticeId) {
            result[data.noticeId] = true;
          }
        });
      } catch (error) {
        console.error('읽음 상태 조회 실패:', error);
      }
    }

    return result;
  }

  async markAsRead(userId: string, noticeId: string): Promise<void> {
    const readRef = doc(
      this.db,
      this.noticesCollection,
      noticeId,
      'readBy',
      userId
    );
    await setDoc(readRef, {
      userId,
      noticeId,
      isRead: true,
      readAt: serverTimestamp(),
    });
  }

  async markAllAsRead(userId: string, noticeIds: string[]): Promise<void> {
    if (noticeIds.length === 0) {return;}

    const batch = writeBatch(this.db);

    noticeIds.forEach((noticeId) => {
      const readRef = doc(
        this.db,
        this.noticesCollection,
        noticeId,
        'readBy',
        userId
      );
      batch.set(readRef, {
        userId,
        noticeId,
        isRead: true,
        readAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  async toggleLike(noticeId: string, userId: string): Promise<boolean> {
    const likeRef = doc(
      this.db,
      this.noticesCollection,
      noticeId,
      'likes',
      userId
    );
    const noticeRef = doc(this.db, this.noticesCollection, noticeId);

    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(noticeRef, { likeCount: increment(-1) });
      return false;
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(noticeRef, { likeCount: increment(1) });
      return true;
    }
  }

  async isLiked(noticeId: string, userId: string): Promise<boolean> {
    const likeRef = doc(
      this.db,
      this.noticesCollection,
      noticeId,
      'likes',
      userId
    );
    const snapshot = await getDoc(likeRef);
    return snapshot.exists();
  }

  async getComments(noticeId: string): Promise<NoticeCommentTreeNode[]> {
    const commentsRef = collection(this.db, this.commentsCollection);
    const q = query(
      commentsRef,
      where('noticeId', '==', noticeId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);

    const comments: Comment[] = snapshot.docs.map(
      (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        this.mapDocToComment(docSnap),
    );

    return this.buildCommentTree(comments);
  }

  subscribeToComments(
    noticeId: string,
    callbacks: SubscriptionCallbacks<NoticeCommentTreeNode[]>
  ): Unsubscribe {
    const commentsRef = collection(this.db, this.commentsCollection);
    const q = query(
      commentsRef,
      where('noticeId', '==', noticeId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const comments: Comment[] = snapshot.docs.map(
          (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
            this.mapDocToComment(docSnap),
        );

        callbacks.onData(this.buildCommentTree(comments));
      },
      (error) => callbacks.onError(error as Error),
    );
  }

  async createComment(
    noticeId: string,
    comment: CommentFormData & { userId: string; userDisplayName: string }
  ): Promise<string> {
    const commentsRef = collection(this.db, this.commentsCollection);
    const isAnonymous = comment.isAnonymous ?? true;

    const newComment: Record<string, unknown> = {
      ...comment,
      noticeId,
      isAnonymous,
      replyCount: 0,
      createdAt: serverTimestamp(),
      isDeleted: false,
      parentId: comment.parentId || null,
    };

    if (isAnonymous) {
      newComment.anonId = `${noticeId}:${comment.userId}`;
    }

    const docRef = await addDoc(commentsRef, newComment);

    const noticeRef = doc(this.db, this.noticesCollection, noticeId);
    await updateDoc(noticeRef, { commentCount: increment(1) });

    return docRef.id;
  }

  async updateComment(
    _noticeId: string,
    commentId: string,
    content: string
  ): Promise<void> {
    const commentRef = doc(this.db, this.commentsCollection, commentId);
    await updateDoc(commentRef, {
      content,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteComment(noticeId: string, commentId: string): Promise<void> {
    const commentRef = doc(this.db, this.commentsCollection, commentId);
    await updateDoc(commentRef, {
      isDeleted: true,
      content: '[삭제된 댓글입니다]',
      updatedAt: serverTimestamp(),
    });

    const noticeRef = doc(this.db, this.noticesCollection, noticeId);
    await updateDoc(noticeRef, { commentCount: increment(-1) });
  }

  async incrementViewCount(noticeId: string): Promise<void> {
    try {
      const noticeRef = doc(this.db, this.noticesCollection, noticeId);
      await updateDoc(noticeRef, {
        viewCount: increment(1),
      });
    } catch (error) {
      console.error('공지 조회수 증가 실패:', error);
      throw error;
    }
  }

  private mapDocToNotice(
    docSnap:
      | FirebaseFirestoreTypes.DocumentSnapshot
      | FirebaseFirestoreTypes.QueryDocumentSnapshot
  ): Notice {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data?.title || '',
      content: data?.content || '',
      link: data?.link || '',
      postedAt: data?.postedAt,
      category: data?.category || '',
      createdAt: data?.createdAt || '',
      author: data?.author || '',
      department: data?.department || '',
      source: data?.source || '',
      contentDetail: data?.contentDetail || '',
      contentAttachments: data?.contentAttachments || [],
      likeCount: data?.likeCount || 0,
      commentCount: data?.commentCount || 0,
      viewCount: data?.viewCount || 0,
    };
  }

  private mapDocToComment(
    docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot
  ): Comment {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      noticeId: data?.noticeId || '',
      userId: data?.userId || '',
      userDisplayName: data?.userDisplayName || '',
      content: data?.content || '',
      isAnonymous: data?.isAnonymous ?? true,
      anonId: data?.anonId,
      parentId: data?.parentId || null,
      replyCount: data?.replyCount || 0,
      isDeleted: data?.isDeleted || false,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate(),
    };
  }

  private buildCommentTree(comments: Comment[]): NoticeCommentTreeNode[] {
    const commentMap = new Map<string, NoticeCommentTreeNode>();
    const roots: NoticeCommentTreeNode[] = [];

    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach((comment) => {
      const node = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}

export const FirestoreNoticeRepository = FirebaseNoticeRepository;
