// SKTaxi: Notification Action Repository Firebase 구현체
// 동승 요청 승인/거절 등 알림 관련 액션 Firebase Firestore 구현

import firestore, {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  query,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import {
  INotificationActionRepository,
  JoinRequestStatusValue,
} from '../interfaces/INotificationActionRepository';

interface JoinRequestData {
  status?: JoinRequestStatusValue;
}

interface UserData {
  displayName?: string;
}

export class FirestoreNotificationActionRepository implements INotificationActionRepository {
  private db = firestore(getApp());

  async getJoinRequestStatus(requestId: string): Promise<JoinRequestStatusValue | null> {
    try {
      const requestDoc = await getDoc(doc(collection(this.db, 'joinRequests'), requestId));
      const data = requestDoc.data() as JoinRequestData | undefined;
      if (!data?.status) return null;
      return data.status;
    } catch (error) {
      console.error('getJoinRequestStatus 실패:', error);
      return null;
    }
  }

  async acceptJoinRequest(requestId: string, partyId: string, requesterId: string): Promise<void> {
    try {
      // 현재 요청 상태 확인
      const status = await this.getJoinRequestStatus(requestId);
      if (status !== 'pending') {
        console.log('이미 처리된 요청:', status);
        return;
      }

      // joinRequests 상태를 accepted로 변경
      await updateDoc(doc(collection(this.db, 'joinRequests'), requestId), {
        status: 'accepted',
      });

      // parties 컬렉션의 members 배열에 requesterId 추가
      await updateDoc(doc(collection(this.db, 'parties'), partyId), {
        members: arrayUnion(requesterId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('acceptJoinRequest 실패:', error);
      throw error;
    }
  }

  async declineJoinRequest(requestId: string): Promise<void> {
    try {
      // 현재 요청 상태 확인
      const status = await this.getJoinRequestStatus(requestId);
      if (status !== 'pending') {
        console.log('이미 처리된 요청:', status);
        return;
      }

      await updateDoc(doc(collection(this.db, 'joinRequests'), requestId), {
        status: 'declined',
      });
    } catch (error) {
      console.error('declineJoinRequest 실패:', error);
      throw error;
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

      // 배치 삭제
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

  async getUserDisplayName(userId: string): Promise<string> {
    try {
      const userDoc = await getDoc(doc(collection(this.db, 'users'), userId));
      const userData = userDoc.data() as UserData | undefined;
      return userData?.displayName || '익명';
    } catch (error) {
      console.error('getUserDisplayName 실패:', error);
      return '익명';
    }
  }
}
