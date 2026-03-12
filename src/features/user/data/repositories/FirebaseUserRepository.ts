import {
  arrayRemove,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import {
  UserAccountInfo,
  UserDisplayNameMap,
  UserProfile,
} from '../../model/types';
import {
  IUserRepository,
  SubscriptionCallbacks,
  Unsubscribe,
} from './IUserRepository';

export class FirebaseUserRepository implements IUserRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly usersCollection = 'users';

  constructor() {
    this.db = getFirestore();
  }

  subscribeToUserProfile(
    userId: string,
    callbacks: SubscriptionCallbacks<UserProfile | null>,
  ): Unsubscribe {
    const docRef = doc(this.db, this.usersCollection, userId);

    return onSnapshot(
      docRef,
      (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
        callbacks.onData(this.toUserProfile(snapshot));
      },
      error => callbacks.onError(error as Error),
    );
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(this.db, this.usersCollection, userId);
    const snapshot = await getDoc(docRef);

    return this.toUserProfile(snapshot);
  }

  async getUserDisplayNames(userIds: string[]): Promise<UserDisplayNameMap> {
    if (userIds.length === 0) {
      return {};
    }

    const result: UserDisplayNameMap = {};
    const chunks: string[][] = [];

    for (let index = 0; index < userIds.length; index += 10) {
      chunks.push(userIds.slice(index, index + 10));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async userId => {
        const docRef = doc(this.db, this.usersCollection, userId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const profile = this.toUserProfile(snapshot);
          result[userId] = profile?.displayName || '알 수 없음';
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
    updates: Partial<UserProfile>,
  ): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);

    await updateDoc(docRef, {
      ...this.normalizeAccountFields(updates),
      lastActiveAt: serverTimestamp(),
    });
  }

  async createUserProfile(
    userId: string,
    profile: Omit<UserProfile, 'id'>,
  ): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);

    await setDoc(docRef, {
      ...this.normalizeAccountFields(profile),
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
  }

  async saveFcmToken(userId: string, token: string): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);

    await setDoc(docRef, {
      fcmTokens: [token],
      lastActiveAt: serverTimestamp(),
    }, { merge: true });
  }

  async removeFcmToken(userId: string, token: string): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);

    await updateDoc(docRef, {
      fcmTokens: arrayRemove(token),
    });
  }

  async clearFcmTokens(userId: string): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);

    await updateDoc(docRef, {
      fcmTokens: [],
      lastActiveAt: serverTimestamp(),
    });
  }

  async getUserBookmarks(userId: string): Promise<string[]> {
    const bookmarksRef = collection(
      this.db,
      this.usersCollection,
      userId,
      'bookmarks',
    );
    const snapshot = await getDocs(bookmarksRef);

    return snapshot.docs.map(
      (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => docSnap.id,
    );
  }

  async addBookmark(userId: string, postId: string): Promise<void> {
    const bookmarkRef = doc(
      this.db,
      this.usersCollection,
      userId,
      'bookmarks',
      postId,
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
      postId,
    );

    await deleteDoc(bookmarkRef);
  }

  subscribeToBookmarks(
    userId: string,
    callbacks: SubscriptionCallbacks<string[]>,
  ): Unsubscribe {
    const bookmarksRef = collection(
      this.db,
      this.usersCollection,
      userId,
      'bookmarks',
    );

    return onSnapshot(
      bookmarksRef,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const bookmarks = snapshot.docs.map(
          (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => docSnap.id,
        );
        callbacks.onData(bookmarks);
      },
      error => callbacks.onError(error as Error),
    );
  }

  async deleteAccountInfo(userId: string): Promise<void> {
    const docRef = doc(this.db, this.usersCollection, userId);

    await updateDoc(docRef, {
      account: deleteField(),
      accountInfo: deleteField(),
      realname: deleteField(),
      lastActiveAt: serverTimestamp(),
    });
  }

  async checkDisplayNameAvailable(
    displayName: string,
    excludeUserId?: string,
  ): Promise<void> {
    const trimmed = displayName.trim();

    if (!trimmed) {
      throw new Error('닉네임을 입력해주세요.');
    }

    try {
      const usersRef = collection(this.db, this.usersCollection);
      const displayNameQuery = query(usersRef, where('displayName', '==', trimmed));
      const snapshot = await getDocs(displayNameQuery);

      const conflict = snapshot.docs.find(
        (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
          docSnap.id !== excludeUserId,
      );

      if (conflict) {
        throw new Error(
          '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.',
        );
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('이미 사용 중인 닉네임')
      ) {
        throw error;
      }

      console.error('Error checking displayName duplication:', error);
      throw new Error(
        '닉네임 중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }

  private toUserProfile(
    snapshot: FirebaseFirestoreTypes.DocumentSnapshot,
  ): UserProfile | null {
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as Omit<UserProfile, 'id'>;
    const normalized = this.normalizeAccountFields(data);

    return {
      id: snapshot.id,
      ...normalized,
    };
  }

  private normalizeAccountFields<T extends Partial<UserProfile>>(payload: T): T {
    const nextPayload = {
      ...payload,
    } as T & {
      account?: UserAccountInfo | null;
      accountInfo?: UserAccountInfo | null;
    };

    if ('accountInfo' in nextPayload) {
      const accountInfo = nextPayload.accountInfo ?? null;
      nextPayload.accountInfo = accountInfo;
      nextPayload.account = accountInfo;
      return nextPayload;
    }

    if ('account' in nextPayload) {
      const account = nextPayload.account ?? null;
      nextPayload.account = account;
      nextPayload.accountInfo = account;
    }

    return nextPayload;
  }
}
