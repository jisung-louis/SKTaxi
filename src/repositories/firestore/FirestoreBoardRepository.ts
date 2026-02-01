// SKTaxi: Board Repository Firestore 구현체
//
// ⚠️ FIREBASE 특화 구현 - Spring 전환 시 참고하지 말 것 ⚠️
//
// 이 구현체는 Firebase Firestore의 특성에 맞춰 설계되었습니다:
// - Top-level collection 사용 (boardComments, boardPosts 등)
// - NoSQL 문서 구조
//
// Spring + RDB 전환 시:
// - 정규화된 테이블 구조 사용 (board_posts, board_comments + 외래키)
// - Spring Data JPA 또는 MyBatis 표준 패턴 적용
// - RESTful API 엔드포인트 설계
// - 이 파일의 구현 방식이 아닌, IBoardRepository 인터페이스만 참고

import firestore, {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  where,
  limit,
  startAfter,
  increment,
  getCountFromServer,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';

import { BoardPost, BoardComment, BoardImage } from '../../types/board';
import {
  IBoardRepository,
  BoardFilterOptions,
  CommentTreeNode,
} from '../interfaces/IBoardRepository';
import { PaginatedResult } from '../interfaces/IChatRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../interfaces/IPartyRepository';

/**
 * Firestore 기반 Board Repository 구현체
 */
export class FirestoreBoardRepository implements IBoardRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly postsCollection = 'boardPosts';
  private readonly commentsCollection = 'boardComments'; // Top-level collection

  constructor() {
    this.db = firestore(getApp());
  }

  // === 게시물 관련 ===

  async getPosts(
    filters: BoardFilterOptions,
    postLimit: number
  ): Promise<PaginatedResult<BoardPost>> {
    let q = query(
      collection(this.db, this.postsCollection),
      where('isDeleted', '==', false)
    );

    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.authorId) {
      q = query(q, where('authorId', '==', filters.authorId));
    }

    // 정렬 적용
    const sortField = this.getSortField(filters.sortBy);
    q = query(q, orderBy(sortField, 'desc'), limit(postLimit));

    const snapshot = await getDocs(q);

    const posts: BoardPost[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
      this.mapDocToPost(docSnap)
    );

    return {
      data: posts,
      hasMore: snapshot.docs.length === postLimit,
      cursor: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  }

  async getMorePosts(
    filters: BoardFilterOptions,
    cursor: unknown,
    postLimit: number
  ): Promise<PaginatedResult<BoardPost>> {
    const cursorDoc = cursor as FirebaseFirestoreTypes.QueryDocumentSnapshot;
    if (!cursorDoc) {
      return { data: [], hasMore: false, cursor: null };
    }

    let q = query(
      collection(this.db, this.postsCollection),
      where('isDeleted', '==', false)
    );

    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    const sortField = this.getSortField(filters.sortBy);
    q = query(q, orderBy(sortField, 'desc'), startAfter(cursorDoc), limit(postLimit));

    const snapshot = await getDocs(q);

    const posts: BoardPost[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
      this.mapDocToPost(docSnap)
    );

    return {
      data: posts,
      hasMore: snapshot.docs.length === postLimit,
      cursor: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  }

  subscribeToPosts(
    filters: BoardFilterOptions,
    postLimit: number,
    callbacks: SubscriptionCallbacks<BoardPost[]>
  ): Unsubscribe {
    let q = query(
      collection(this.db, this.postsCollection),
      where('isDeleted', '==', false)
    );

    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    const sortField = this.getSortField(filters.sortBy);
    q = query(q, orderBy(sortField, 'desc'), limit(postLimit));

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const posts: BoardPost[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          this.mapDocToPost(docSnap)
        );
        callbacks.onData(posts);
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async getPost(postId: string): Promise<BoardPost | null> {
    const docRef = doc(this.db, this.postsCollection, postId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return this.mapDocToPost(snapshot);
    }

    return null;
  }

  subscribeToPost(
    postId: string,
    callbacks: SubscriptionCallbacks<BoardPost | null>
  ): Unsubscribe {
    const docRef = doc(this.db, this.postsCollection, postId);

    return onSnapshot(
      docRef,
      (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
        if (snapshot.exists()) {
          callbacks.onData(this.mapDocToPost(snapshot));
        } else {
          callbacks.onData(null);
        }
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async createPost(
    post: Omit<
      BoardPost,
      'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount' | 'bookmarkCount'
    >
  ): Promise<string> {
    const docRef = await addDoc(collection(this.db, this.postsCollection), {
      ...post,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  }

  async updatePost(postId: string, updates: Partial<BoardPost>): Promise<void> {
    const docRef = doc(this.db, this.postsCollection, postId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async deletePost(postId: string): Promise<void> {
    const docRef = doc(this.db, this.postsCollection, postId);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
  }

  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const likeRef = doc(this.db, this.postsCollection, postId, 'likes', userId);
    const postRef = doc(this.db, this.postsCollection, postId);

    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likeCount: increment(-1) });
      return false;
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(postRef, { likeCount: increment(1) });
      return true;
    }
  }

  async isLiked(postId: string, userId: string): Promise<boolean> {
    const likeRef = doc(this.db, this.postsCollection, postId, 'likes', userId);
    const snapshot = await getDoc(likeRef);
    return snapshot.exists();
  }

  async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    const bookmarkRef = doc(this.db, this.postsCollection, postId, 'bookmarks', userId);
    const postRef = doc(this.db, this.postsCollection, postId);

    const bookmarkSnap = await getDoc(bookmarkRef);

    if (bookmarkSnap.exists()) {
      await deleteDoc(bookmarkRef);
      await updateDoc(postRef, { bookmarkCount: increment(-1) });
      return false;
    } else {
      await setDoc(bookmarkRef, { createdAt: serverTimestamp() });
      await updateDoc(postRef, { bookmarkCount: increment(1) });
      return true;
    }
  }

  async isBookmarked(postId: string, userId: string): Promise<boolean> {
    const bookmarkRef = doc(this.db, this.postsCollection, postId, 'bookmarks', userId);
    const snapshot = await getDoc(bookmarkRef);
    return snapshot.exists();
  }

  async incrementViewCount(postId: string): Promise<void> {
    const docRef = doc(this.db, this.postsCollection, postId);
    await updateDoc(docRef, { viewCount: increment(1) });
  }

  // === 댓글 관련 (Top-level collection 사용) ===

  async getComments(postId: string): Promise<CommentTreeNode[]> {
    const commentsRef = collection(this.db, this.commentsCollection);
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);

    const comments: BoardComment[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
      this.mapDocToComment(docSnap)
    );

    return this.buildCommentTree(comments);
  }

  subscribeToComments(
    postId: string,
    callbacks: SubscriptionCallbacks<CommentTreeNode[]>
  ): Unsubscribe {
    const commentsRef = collection(this.db, this.commentsCollection);
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const comments: BoardComment[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          this.mapDocToComment(docSnap)
        );

        callbacks.onData(this.buildCommentTree(comments));
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async createComment(
    postId: string,
    comment: Omit<BoardComment, 'id' | 'postId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const commentsRef = collection(this.db, this.commentsCollection);
    const docRef = await addDoc(commentsRef, {
      ...comment,
      postId,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 게시물 댓글 수 증가
    const postRef = doc(this.db, this.postsCollection, postId);
    await updateDoc(postRef, { commentCount: increment(1) });

    return docRef.id;
  }

  async updateComment(
    _postId: string, // Top-level collection이므로 postId 불필요하지만 인터페이스 유지
    commentId: string,
    content: string
  ): Promise<void> {
    const commentRef = doc(this.db, this.commentsCollection, commentId);
    await updateDoc(commentRef, {
      content,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    const commentRef = doc(this.db, this.commentsCollection, commentId);
    await updateDoc(commentRef, {
      isDeleted: true,
      content: '[삭제된 댓글입니다]',
      updatedAt: serverTimestamp(),
    });

    // 게시물 댓글 수 감소
    const postRef = doc(this.db, this.postsCollection, postId);
    await updateDoc(postRef, { commentCount: increment(-1) });
  }

  // === 이미지 관련 ===

  async uploadImage(uri: string, postId?: string): Promise<BoardImage> {
    const filename = `board/${postId || 'temp'}/${Date.now()}.jpg`;
    const ref = storage().ref(filename);

    await ref.putFile(uri);
    const url = await ref.getDownloadURL();

    return {
      url,
      width: 0,
      height: 0,
    };
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const ref = storage().refFromURL(imageUrl);
    await ref.delete();
  }

  // === 통계 관련 ===

  async getCategoryCounts(categories: string[]): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    // 전체 게시물 수
    const allQuery = query(
      collection(this.db, this.postsCollection),
      where('isDeleted', '==', false)
    );
    const allSnapshot = await getCountFromServer(allQuery);
    counts['all'] = allSnapshot.data().count;

    // 각 카테고리별 게시물 수
    for (const categoryId of categories) {
      const categoryQuery = query(
        collection(this.db, this.postsCollection),
        where('isDeleted', '==', false),
        where('category', '==', categoryId)
      );
      const categorySnapshot = await getCountFromServer(categoryQuery);
      counts[categoryId] = categorySnapshot.data().count;
    }

    return counts;
  }

  // === Private 헬퍼 메서드 ===

  private getSortField(sortBy?: string): string {
    switch (sortBy) {
      case 'popular':
        return 'likeCount';
      case 'mostCommented':
        return 'commentCount';
      case 'mostViewed':
        return 'viewCount';
      default:
        return 'createdAt';
    }
  }

  private mapDocToPost(
    docSnap: FirebaseFirestoreTypes.DocumentSnapshot | FirebaseFirestoreTypes.QueryDocumentSnapshot
  ): BoardPost {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data?.title || '',
      content: data?.content || '',
      authorId: data?.authorId || '',
      authorName: data?.authorName || '',
      authorProfileImage: data?.authorProfileImage,
      isAnonymous: data?.isAnonymous || false,
      anonId: data?.anonId,
      category: data?.category || 'general',
      viewCount: data?.viewCount || 0,
      likeCount: data?.likeCount || 0,
      commentCount: data?.commentCount || 0,
      bookmarkCount: data?.bookmarkCount || 0,
      isPinned: data?.isPinned || false,
      isDeleted: data?.isDeleted || false,
      images: data?.images || [],
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
      lastCommentAt: data?.lastCommentAt?.toDate(),
    };
  }

  private mapDocToComment(
    docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot
  ): BoardComment {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      postId: data?.postId || '',
      authorId: data?.authorId || '',
      authorName: data?.authorName || '',
      authorProfileImage: data?.authorProfileImage,
      content: data?.content || '',
      isAnonymous: data?.isAnonymous || false,
      anonId: data?.anonId,
      parentId: data?.parentId || null,
      isDeleted: data?.isDeleted || false,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate(),
    };
  }

  private buildCommentTree(comments: BoardComment[]): CommentTreeNode[] {
    const map = new Map<string, CommentTreeNode>();
    const roots: CommentTreeNode[] = [];

    // 모든 댓글을 Map에 저장
    comments.forEach((comment) => {
      map.set(comment.id, { ...comment, replies: [] });
    });

    // 트리 구조 생성
    comments.forEach((comment) => {
      const node = map.get(comment.id)!;
      if (comment.parentId && map.has(comment.parentId)) {
        map.get(comment.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
