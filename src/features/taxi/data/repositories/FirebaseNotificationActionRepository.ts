import firestore, {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

import {
  INotificationActionRepository,
  JoinRequestStatusValue,
} from './INotificationActionRepository';

interface JoinRequestData {
  status?: JoinRequestStatusValue;
}

export class FirebaseNotificationActionRepository implements INotificationActionRepository {
  private db = firestore(getApp());

  async getJoinRequestStatus(requestId: string): Promise<JoinRequestStatusValue | null> {
    try {
      const requestDoc = await getDoc(doc(collection(this.db, 'joinRequests'), requestId));
      const data = requestDoc.data() as JoinRequestData | undefined;
      if (!data?.status) {
        return null;
      }
      return data.status;
    } catch (error) {
      console.error('getJoinRequestStatus 실패:', error);
      return null;
    }
  }

  async deleteJoinRequestNotifications(userId: string, partyId: string): Promise<void> {
    try {
      const notificationsRef = collection(this.db, 'userNotifications', userId, 'notifications');
      const q = query(
        notificationsRef,
        where('type', '==', 'party_join_request'),
        where('data.partyId', '==', partyId)
      );
      const snapshot = await getDocs(q);

      const batch = writeBatch(this.db);
      snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();

      console.log(`✅ 요청자(${userId})의 동승 요청 알림 ${snapshot.size}개 삭제 완료`);
    } catch (error) {
      console.error('동승 요청 알림 삭제 실패:', error);
    }
  }
}

export { FirebaseNotificationActionRepository as FirestoreNotificationActionRepository };
