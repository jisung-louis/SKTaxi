// SKTaxi: App Notice Repository Firestore 구현체

import firestore, {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

import {
  IAppNoticeRepository,
  AppNotice,
} from '../interfaces/IAppNoticeRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../interfaces/IPartyRepository';

/**
 * Firestore 기반 App Notice Repository 구현체
 */
export class FirestoreAppNoticeRepository implements IAppNoticeRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly collectionName = 'appNotices';

  constructor() {
    this.db = firestore(getApp());
  }

  private parseAppNotice(docSnap: FirebaseFirestoreTypes.DocumentSnapshot): AppNotice {
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      title: data?.title || '',
      content: data?.content || '',
      category: data?.category || 'service',
      priority: data?.priority || 'normal',
      publishedAt: data?.publishedAt?.toDate?.() || new Date(),
      updatedAt: data?.updatedAt?.toDate?.() || undefined,
      imageUrls: Array.isArray(data?.imageUrls) ? data.imageUrls.filter(Boolean) : undefined,
      actionUrl: data?.actionUrl || undefined,
    };
  }

  subscribeToAppNotices(callbacks: SubscriptionCallbacks<AppNotice[]>): Unsubscribe {
    const noticesRef = collection(this.db, this.collectionName);
    const q = query(noticesRef, orderBy('publishedAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const notices: AppNotice[] = [];
        snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          notices.push(this.parseAppNotice(docSnap));
        });
        callbacks.onData(notices);
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async getAppNotices(): Promise<AppNotice[]> {
    const noticesRef = collection(this.db, this.collectionName);
    const q = query(noticesRef, orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);

    const notices: AppNotice[] = [];
    snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      notices.push(this.parseAppNotice(docSnap));
    });

    return notices;
  }

  async getAppNotice(noticeId: string): Promise<AppNotice | null> {
    const docRef = doc(this.db, this.collectionName, noticeId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return this.parseAppNotice(snapshot);
  }

  subscribeToAppNotice(
    noticeId: string,
    callbacks: SubscriptionCallbacks<AppNotice | null>
  ): Unsubscribe {
    const docRef = doc(this.db, this.collectionName, noticeId);

    return onSnapshot(
      docRef,
      (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
        if (snapshot.exists()) {
          callbacks.onData(this.parseAppNotice(snapshot));
        } else {
          callbacks.onData(null);
        }
      },
      (error) => callbacks.onError(error as Error)
    );
  }
}
