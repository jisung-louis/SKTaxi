// SKTaxi: Notification Repository Firestore 구현체
//
// ⚠️ FIREBASE 특화 구현 - Spring 전환 시 참고하지 말 것 ⚠️
//
// Spring + RDB 전환 시:
// - 정규화된 테이블 구조 사용 (notifications 테이블 + user_id 외래키)
// - Spring Data JPA 또는 MyBatis 표준 패턴 적용
// - RESTful API 엔드포인트 설계
// - 이 파일의 구현 방식이 아닌, INotificationRepository 인터페이스만 참고

import firestore, {
  collection,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

import {
  INotificationRepository,
  Notification,
} from '../interfaces/INotificationRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../interfaces/IPartyRepository';

/**
 * Firestore 기반 Notification Repository 구현체
 */
export class FirestoreNotificationRepository implements INotificationRepository {
  private readonly db: FirebaseFirestoreTypes.Module;

  constructor() {
    this.db = firestore(getApp());
  }

  subscribeToNotifications(
    userId: string,
    notificationLimit: number,
    callbacks: SubscriptionCallbacks<Notification[]>
  ): Unsubscribe {
    const notificationsRef = collection(
      this.db,
      'userNotifications',
      userId,
      'notifications'
    );
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(notificationLimit)
    );

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const notifications: Notification[] = snapshot.docs.map(
          (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
            this.mapDocToNotification(docSnap)
        );
        callbacks.onData(notifications);
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notificationRef = doc(
      this.db,
      'userNotifications',
      userId,
      'notifications',
      notificationId
    );

    await updateDoc(notificationRef, {
      isRead: true,
      readAt: serverTimestamp(),
    });
  }

  async markAllAsRead(userId: string, notificationIds: string[]): Promise<void> {
    if (notificationIds.length === 0) return;

    const batch = writeBatch(this.db);

    notificationIds.forEach((notificationId) => {
      const notificationRef = doc(
        this.db,
        'userNotifications',
        userId,
        'notifications',
        notificationId
      );
      batch.update(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const notificationRef = doc(
      this.db,
      'userNotifications',
      userId,
      'notifications',
      notificationId
    );

    await deleteDoc(notificationRef);
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    const notificationsRef = collection(
      this.db,
      'userNotifications',
      userId,
      'notifications'
    );

    const snapshot = await getDocs(notificationsRef);

    if (snapshot.empty) return;

    const batch = writeBatch(this.db);
    snapshot.docs.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  }

  async deleteNotificationsByPartyId(userId: string, partyId: string): Promise<void> {
    const notificationsRef = collection(
      this.db,
      'userNotifications',
      userId,
      'notifications'
    );
    const q = query(notificationsRef, where('data.partyId', '==', partyId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(this.db);
    snapshot.docs.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  }

  private mapDocToNotification(
    docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot
  ): Notification {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      type: data?.type || '',
      title: data?.title || '',
      message: data?.message || '',
      data: data?.data || {},
      isRead: data?.isRead || false,
      readAt: data?.readAt?.toDate(),
      createdAt: data?.createdAt?.toDate() || new Date(),
      icon: data?.icon,
      iconColor: data?.iconColor,
    };
  }
}
