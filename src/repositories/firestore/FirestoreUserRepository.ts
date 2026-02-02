// SKTaxi: User Repository Firestore 구현체
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  deleteField,
  query,
  where,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import {
  IUserRepository,
  UserProfile,
  UserDisplayNameMap,
} from '../interfaces/IUserRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../interfaces/IPartyRepository';

/**
 * Firestore 기반 User Repository 구현체
 */
export class FirestoreUserRepository implements IUserRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly usersCollection = 'users';

  constructor() {
    this.db = getFirestore();
  }

  subscribeToUserProfile(
    userId: string,
    callbacks: SubscriptionCallbacks<UserProfile | null>
  ): Unsubscribe {
    const docRef = doc(this.db, this.usersCollection, userId);

    return onSnapshot(
      docRef,
      (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
        if (snapshot.exists()) {
          callbacks.onData({
            id: snapshot.id,
            ...(snapshot.data() as Omit<UserProfile, 'id'>),
          });
        } else {
          callbacks.onData(null);
        }
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(this.db, this.usersCollection, userId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...(snapshot.data() as Omit<UserProfile, 'id'>),
      };
    }

    return null;
  }

  async getUserDisplayNames(userIds: string[]): Promise<UserDisplayNameMap> {
    if (userIds.length === 0) {return {};}

    const result: UserDisplayNameMap = {};

    // Firestore 'in' 쿼리는 최대 10개까지 지원
    const chunks: string[][] = [];
    for (let i = 0; i < userIds.length; i += 10) {
      chunks.push(userIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      // documentId() 대신 개별 문서 조회 사용
      const promises = chunk.map(async (userId) => {
        const docRef = doc(this.db, this.usersCollection, userId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          result[userId] = data?.displayName || '알 수 없음';
        } else {
          result[userId] = '알 수 없음';
        }
      });

      await Promise.all(promises);
    }

    return result;
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);
    await updateDoc(docRef, {
      ...updates,
      lastActiveAt: serverTimestamp(),
    });
  }

  async createUserProfile(
    userId: string,
    profile: Omit<UserProfile, 'id'>
  ): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);
    await setDoc(docRef, {
      ...profile,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
  }

  async saveFcmToken(userId: string, token: string): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);
    await updateDoc(docRef, {
      fcmTokens: arrayUnion(token),
      lastActiveAt: serverTimestamp(),
    });
  }

  async removeFcmToken(userId: string, token: string): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);
    await updateDoc(docRef, {
      fcmTokens: arrayRemove(token),
    });
  }

  async getUserBookmarks(userId: string): Promise<string[]> {
    const bookmarksRef = collection(this.db, this.usersCollection, userId, 'bookmarks');
    const snapshot = await getDocs(bookmarksRef);

    return snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => docSnap.id);
  }

  async addBookmark(userId: string, postId: string): Promise<void> {
    const bookmarkRef = doc(
      this.db,
      this.usersCollection,
      userId,
      'bookmarks',
      postId
    );
    await setDoc(bookmarkRef, {
      createdAt: serverTimestamp(),
    });
  }

  async removeBookmark(userId: string, postId: string): Promise<void> {
    const bookmarkRef = doc(
      this.db,
      this.usersCollection,
      userId,
      'bookmarks',
      postId
    );
    await deleteDoc(bookmarkRef);
  }

  subscribeToBookmarks(
    userId: string,
    callbacks: SubscriptionCallbacks<string[]>
  ): Unsubscribe {
    const bookmarksRef = collection(this.db, this.usersCollection, userId, 'bookmarks');

    return onSnapshot(
      bookmarksRef,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const bookmarks = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => docSnap.id);
        callbacks.onData(bookmarks);
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async deleteAccountInfo(userId: string): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);
    await updateDoc(docRef, {
      account: deleteField(),
    });
  }

  async checkDisplayNameAvailable(displayName: string, excludeUserId?: string): Promise<void> {
    const trimmed = displayName.trim();
    if (!trimmed) {
      throw new Error('닉네임을 입력해주세요.');
    }

    try {
      const usersRef = collection(this.db, this.usersCollection);
      const q = query(usersRef, where('displayName', '==', trimmed));
      const snap = await getDocs(q);

      const conflict = snap.docs.find(
        (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => docSnap.id !== excludeUserId
      );
      if (conflict) {
        throw new Error('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      }
    } catch (error) {
      // 중복 에러는 그대로 위로 전파
      if (error instanceof Error && error.message.includes('이미 사용 중인 닉네임')) {
        throw error;
      }
      console.error('Error checking displayName duplication:', error);
      throw new Error('닉네임 중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }
}
