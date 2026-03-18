import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getStorage, ref } from '@react-native-firebase/storage';

import type {
  BoardComment,
  BoardImage,
  BoardPost,
} from '../../model/types';
import type {
  BoardCommentTreeNode,
  BoardFilterOptions,
  IBoardRepository,
} from './IBoardRepository';
import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import type { PaginatedResult } from '@/shared/types/pagination';

export class FirebaseBoardRepository implements IBoardRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly postsCollection = 'boardPosts';
  private readonly commentsCollection = 'boardComments';

  constructor() {
    this.db = getFirestore();
  }

  async getPosts(
    filters: BoardFilterOptions,
    postLimit: number,
  ): Promise<PaginatedResult<BoardPost>> {
    let q = query(
      collection(this.db, this.postsCollection),
      where('isDeleted', '==', false),
    );

    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.authorId) {
      q = query(q, where('authorId', '==', filters.authorId));
    }

    q = query(q, orderBy(this.getSortField(filters.sortBy), 'desc'), limit(postLimit));

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
      this.mapDocToPost(docSnap),
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
    postLimit: number,
  ): Promise<PaginatedResult<BoardPost>> {
    const cursorDoc = cursor as FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
    if (!cursorDoc) {
      return { data: [], hasMore: false, cursor: null };
    }

    let q = query(
      collection(this.db, this.postsCollection),
      where('isDeleted', '==', false),
    );

    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    q = query(
      q,
      orderBy(this.getSortField(filters.sortBy), 'desc'),
      startAfter(cursorDoc),
      limit(postLimit),
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
      this.mapDocToPost(docSnap),
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
    callbacks: SubscriptionCallbacks<BoardPost[]>,
  ): Unsubscribe {
    let q = query(
      collection(this.db, this.postsCollection),
      where('isDeleted', '==', false),
    );

    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    q = query(q, orderBy(this.getSortField(filters.sortBy), 'desc'), limit(postLimit));

    return onSnapshot(
      q,
      (snapshot) => {
        callbacks.onData(
          snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
            this.mapDocToPost(docSnap),
          ),
        );
      },
      (error) => callbacks.onError(error as Error),
    );
  }

  async getPost(postId: string): Promise<BoardPost | null> {
    const snapshot = await getDoc(doc(this.db, this.postsCollection, postId));
    return snapshot.exists() ? this.mapDocToPost(snapshot) : null;
  }

  subscribeToPost(
    postId: string,
    callbacks: SubscriptionCallbacks<BoardPost | null>,
  ): Unsubscribe {
    return onSnapshot(
      doc(this.db, this.postsCollection, postId),
      (snapshot) => callbacks.onData(snapshot.exists() ? this.mapDocToPost(snapshot) : null),
      (error) => callbacks.onError(error as Error),
    );
  }

  async createPost(
    post: Omit<
      BoardPost,
      'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount' | 'bookmarkCount'
    >,
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
    await updateDoc(doc(this.db, this.postsCollection, postId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async deletePost(postId: string): Promise<void> {
    await updateDoc(doc(this.db, this.postsCollection, postId), {
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
    }

    await setDoc(likeRef, { createdAt: serverTimestamp() });
    await updateDoc(postRef, { likeCount: increment(1) });
    return true;
  }

  async isLiked(postId: string, userId: string): Promise<boolean> {
    return (await getDoc(doc(this.db, this.postsCollection, postId, 'likes', userId))).exists();
  }

  async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    const bookmarkRef = doc(this.db, this.postsCollection, postId, 'bookmarks', userId);
    const postRef = doc(this.db, this.postsCollection, postId);
    const bookmarkSnap = await getDoc(bookmarkRef);

    if (bookmarkSnap.exists()) {
      await deleteDoc(bookmarkRef);
      await updateDoc(postRef, { bookmarkCount: increment(-1) });
      return false;
    }

    await setDoc(bookmarkRef, { createdAt: serverTimestamp() });
    await updateDoc(postRef, { bookmarkCount: increment(1) });
    return true;
  }

  async isBookmarked(postId: string, userId: string): Promise<boolean> {
    return (
      await getDoc(doc(this.db, this.postsCollection, postId, 'bookmarks', userId))
    ).exists();
  }

  async incrementViewCount(postId: string): Promise<void> {
    await updateDoc(doc(this.db, this.postsCollection, postId), {
      viewCount: increment(1),
    });
  }

  async getComments(postId: string): Promise<BoardCommentTreeNode[]> {
    const q = query(
      collection(this.db, this.commentsCollection),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc'),
    );
    const snapshot = await getDocs(q);
    return this.buildCommentTree(
      snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        this.mapDocToComment(docSnap),
      ),
    );
  }

  subscribeToComments(
    postId: string,
    callbacks: SubscriptionCallbacks<BoardCommentTreeNode[]>,
  ): Unsubscribe {
    const q = query(
      collection(this.db, this.commentsCollection),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc'),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        callbacks.onData(
          this.buildCommentTree(
            snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
              this.mapDocToComment(docSnap),
            ),
          ),
        );
      },
      (error) => callbacks.onError(error as Error),
    );
  }

  async createComment(
    postId: string,
    comment: Omit<BoardComment, 'id' | 'postId' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> {
    const docRef = await addDoc(collection(this.db, this.commentsCollection), {
      ...comment,
      postId,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(this.db, this.postsCollection, postId), {
      commentCount: increment(1),
      lastCommentAt: serverTimestamp(),
    });

    return docRef.id;
  }

  async updateComment(
    _postId: string,
    commentId: string,
    content: string,
  ): Promise<void> {
    await updateDoc(doc(this.db, this.commentsCollection, commentId), {
      content,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await updateDoc(doc(this.db, this.commentsCollection, commentId), {
      isDeleted: true,
      content: '[삭제된 댓글입니다]',
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(this.db, this.postsCollection, postId), {
      commentCount: increment(-1),
    });
  }

  async uploadImage(uri: string, postId?: string): Promise<BoardImage> {
    const filename = `board/${postId || 'temp'}/${Date.now()}.jpg`;
    const storageRef = ref(getStorage(), filename);
    await storageRef.putFile(uri);
    const url = await storageRef.getDownloadURL();

    return {
      url,
      width: 0,
      height: 0,
    };
  }

  async deleteImage(imageUrl: string): Promise<void> {
    await ref(getStorage(), imageUrl).delete();
  }

  async getCategoryCounts(categories: string[]): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const allQuery = query(
      collection(this.db, this.postsCollection),
      where('isDeleted', '==', false),
    );

    counts.all = (await getCountFromServer(allQuery)).data().count;

    for (const categoryId of categories) {
      const categoryQuery = query(
        collection(this.db, this.postsCollection),
        where('isDeleted', '==', false),
        where('category', '==', categoryId),
      );
      counts[categoryId] = (await getCountFromServer(categoryQuery)).data().count;
    }

    return counts;
  }

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
    docSnap: FirebaseFirestoreTypes.DocumentSnapshot | FirebaseFirestoreTypes.QueryDocumentSnapshot,
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
    docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): BoardComment {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      postId: data?.postId || '',
      authorId: data?.authorId || '',
      authorName: data?.authorName || '',
      authorProfileImage: data?.authorProfileImage ?? null,
      content: data?.content || '',
      isAnonymous: data?.isAnonymous || false,
      anonId: data?.anonId,
      anonymousOrder: data?.anonymousOrder,
      parentId: data?.parentId || null,
      isDeleted: data?.isDeleted || false,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    };
  }

  private buildCommentTree(comments: BoardComment[]): BoardCommentTreeNode[] {
    const map = new Map<string, BoardCommentTreeNode>();
    const roots: BoardCommentTreeNode[] = [];

    comments.forEach((comment) => {
      map.set(comment.id, { ...comment, replies: [] });
    });

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

export const FirestoreBoardRepository = FirebaseBoardRepository;
