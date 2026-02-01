// SKTaxi: Party Repository Firestore 구현체
// Phase 2에서 완전히 구현 예정, 현재는 스텁

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
  setDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  where,
  limit,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

import { Party } from '../../types/party';
import {
  IPartyRepository,
  Unsubscribe,
  SubscriptionCallbacks,
  PendingJoinRequest,
  JoinRequestStatus,
  JoinRequest,
  PartyMessage,
  AccountMessageData,
  ArrivalMessageData,
  SettlementData,
} from '../interfaces/IPartyRepository';

/**
 * Firestore 기반 Party Repository 구현체
 */
export class FirestorePartyRepository implements IPartyRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly collectionName = 'parties';

  constructor() {
    this.db = firestore(getApp());
  }

  subscribeToParties(callbacks: SubscriptionCallbacks<Party[]>): Unsubscribe {
    const q = query(
      collection(this.db, this.collectionName),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const parties: Party[] = snapshot.docs
          .map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Party, 'id'>),
          }))
          .filter((party) => party.status !== 'ended');
        callbacks.onData(parties);
      },
      (error) => {
        callbacks.onError(error as Error);
      }
    );

    return unsubscribe;
  }

  subscribeToParty(
    partyId: string,
    callbacks: SubscriptionCallbacks<Party | null>
  ): Unsubscribe {
    const docRef = doc(this.db, this.collectionName, partyId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
        if (snapshot.exists()) {
          callbacks.onData({
            id: snapshot.id,
            ...(snapshot.data() as Omit<Party, 'id'>),
          });
        } else {
          callbacks.onData(null);
        }
      },
      (error) => {
        callbacks.onError(error as Error);
      }
    );

    return unsubscribe;
  }

  subscribeToMyParty(
    userId: string,
    callbacks: SubscriptionCallbacks<Party | null>
  ): Unsubscribe {
    // members 배열에 userId가 포함된 파티 중 ended가 아닌 것을 찾음
    const q = query(
      collection(this.db, this.collectionName),
      where('members', 'array-contains', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        // ended가 아닌 파티 중 첫 번째를 반환
        const activeParty = snapshot.docs
          .map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Party, 'id'>),
          }))
          .find((party) => party.status !== 'ended');

        callbacks.onData(activeParty || null);
      },
      (error) => {
        callbacks.onError(error as Error);
      }
    );

    return unsubscribe;
  }

  async createParty(party: Omit<Party, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.db, this.collectionName), {
      ...party,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async updateParty(partyId: string, updates: Partial<Party>): Promise<void> {
    const docRef = doc(this.db, this.collectionName, partyId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteParty(partyId: string, reason: Party['endReason']): Promise<void> {
    const docRef = doc(this.db, this.collectionName, partyId);
    await updateDoc(docRef, {
      status: 'ended',
      endReason: reason,
      endedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async addMember(partyId: string, userId: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, partyId);
    await updateDoc(docRef, {
      members: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
  }

  async removeMember(partyId: string, userId: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, partyId);
    await updateDoc(docRef, {
      members: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });
  }

  async getParty(partyId: string): Promise<Party | null> {
    const docRef = doc(this.db, this.collectionName, partyId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...(snapshot.data() as Omit<Party, 'id'>),
      };
    }

    return null;
  }

  subscribeToJoinRequestCount(
    leaderId: string,
    callbacks: SubscriptionCallbacks<number>
  ): Unsubscribe {
    // 먼저 리더의 파티 목록을 구독
    const partiesQuery = query(
      collection(this.db, this.collectionName),
      where('leaderId', '==', leaderId)
    );

    let unsubscribeJoinRequests: (() => void) | undefined;

    const unsubscribeParties = onSnapshot(
      partiesQuery,
      (partiesSnapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        // 이전 joinRequests 구독 해제
        if (unsubscribeJoinRequests) {
          unsubscribeJoinRequests();
          unsubscribeJoinRequests = undefined;
        }

        if (partiesSnapshot.empty) {
          callbacks.onData(0);
          return;
        }

        const partyIds = partiesSnapshot.docs.map(
          (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => docSnap.id
        );

        if (partyIds.length === 0) {
          callbacks.onData(0);
          return;
        }

        // 파티들의 pending 동승 요청 구독
        const joinRequestsQuery = query(
          collection(this.db, 'joinRequests'),
          where('partyId', 'in', partyIds),
          where('status', '==', 'pending')
        );

        unsubscribeJoinRequests = onSnapshot(
          joinRequestsQuery,
          (joinRequestsSnapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
            callbacks.onData(joinRequestsSnapshot.size);
          },
          (error) => {
            callbacks.onError(error as Error);
          }
        );
      },
      (error) => {
        callbacks.onError(error as Error);
      }
    );

    // 두 구독 모두 해제하는 함수 반환
    return () => {
      unsubscribeParties();
      if (unsubscribeJoinRequests) {
        unsubscribeJoinRequests();
      }
    };
  }

  subscribeToMyPendingJoinRequest(
    requesterId: string,
    callbacks: SubscriptionCallbacks<PendingJoinRequest | null>
  ): Unsubscribe {
    const q = query(
      collection(this.db, 'joinRequests'),
      where('requesterId', '==', requesterId),
      where('status', '==', 'pending'),
      limit(1)
    );

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        if (snapshot.empty) {
          callbacks.onData(null);
        } else {
          const docSnap = snapshot.docs[0];
          const data = docSnap.data();
          callbacks.onData({
            requestId: docSnap.id,
            partyId: data.partyId as string,
          });
        }
      },
      (error) => {
        callbacks.onError(error as Error);
      }
    );
  }

  subscribeToJoinRequest(
    requestId: string,
    callbacks: SubscriptionCallbacks<JoinRequestStatus | null>
  ): Unsubscribe {
    const requestRef = doc(this.db, 'joinRequests', requestId);

    return onSnapshot(
      requestRef,
      (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
        if (!snapshot.exists()) {
          callbacks.onData(null);
        } else {
          const data = snapshot.data()!;
          callbacks.onData({
            requestId: snapshot.id,
            partyId: data.partyId as string,
            status: data.status as JoinRequestStatus['status'],
          });
        }
      },
      (error) => {
        callbacks.onError(error as Error);
      }
    );
  }

  async cancelJoinRequest(requestId: string): Promise<void> {
    const requestRef = doc(this.db, 'joinRequests', requestId);
    await updateDoc(requestRef, { status: 'canceled' });
  }

  async createJoinRequest(
    partyId: string,
    leaderId: string,
    requesterId: string
  ): Promise<string> {
    const docRef = await addDoc(collection(this.db, 'joinRequests'), {
      partyId,
      leaderId,
      requesterId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  // === 파티 채팅 메시지 관련 ===

  subscribeToPartyMessages(
    partyId: string,
    callbacks: SubscriptionCallbacks<PartyMessage[]>
  ): Unsubscribe {
    const messagesRef = collection(this.db, 'chats', partyId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const messages: PartyMessage[] = snapshot.docs.map(
          (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<PartyMessage, 'id'>),
          })
        );
        callbacks.onData(messages);
      },
      (error) => {
        callbacks.onError(error as Error);
      }
    );
  }

  async sendPartyMessage(
    partyId: string,
    senderId: string,
    text: string
  ): Promise<void> {
    // 사용자 정보 조회
    const userDoc = await getDoc(doc(this.db, 'users', senderId));
    const userData = userDoc.data();
    const senderName = userData?.displayName || userData?.email || '익명';

    const messagesRef = collection(this.db, 'chats', partyId, 'messages');
    await addDoc(messagesRef, {
      partyId,
      senderId,
      senderName,
      text: text.trim(),
      type: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 채팅방 lastMessage 업데이트
    const chatRef = doc(this.db, 'chats', partyId);
    await updateDoc(chatRef, {
      lastMessage: text.trim(),
      lastMessageAt: serverTimestamp(),
    }).catch(() => {
      // 채팅방 문서가 없을 수 있음 - 무시
    });
  }

  async sendSystemMessage(partyId: string, text: string): Promise<void> {
    const messagesRef = collection(this.db, 'chats', partyId, 'messages');
    await addDoc(messagesRef, {
      partyId,
      senderId: 'system',
      senderName: '시스템',
      text,
      type: 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 채팅방 lastMessage 업데이트
    const chatRef = doc(this.db, 'chats', partyId);
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    }).catch(() => {});
  }

  async sendAccountMessage(
    partyId: string,
    senderId: string,
    accountData: AccountMessageData
  ): Promise<void> {
    const userDoc = await getDoc(doc(this.db, 'users', senderId));
    const userData = userDoc.data();
    const senderName = userData?.displayName || userData?.email || '익명';

    const messagesRef = collection(this.db, 'chats', partyId, 'messages');
    await addDoc(messagesRef, {
      partyId,
      senderId,
      senderName,
      text: '',
      type: 'account',
      accountData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async sendArrivedMessage(
    partyId: string,
    senderId: string,
    arrivalData: ArrivalMessageData
  ): Promise<void> {
    const userDoc = await getDoc(doc(this.db, 'users', senderId));
    const userData = userDoc.data();
    const senderName = userData?.displayName || userData?.email || '익명';

    const messagesRef = collection(this.db, 'chats', partyId, 'messages');
    await addDoc(messagesRef, {
      partyId,
      senderId,
      senderName,
      text: '',
      type: 'arrived',
      arrivalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async sendEndMessage(
    partyId: string,
    senderId: string,
    partyArrived: boolean
  ): Promise<void> {
    const userDoc = await getDoc(doc(this.db, 'users', senderId));
    const userData = userDoc.data();
    const senderName = userData?.displayName || userData?.email || '익명';

    const messagesRef = collection(this.db, 'chats', partyId, 'messages');
    await addDoc(messagesRef, {
      partyId,
      senderId,
      senderName,
      text: partyArrived ? '동승이 종료되었어요.' : '파티가 해체되었어요.',
      type: 'end',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // === 동승 요청 관리 (확장) ===

  subscribeToJoinRequests(
    partyId: string,
    callbacks: SubscriptionCallbacks<JoinRequest[]>
  ): Unsubscribe {
    const q = query(
      collection(this.db, 'joinRequests'),
      where('partyId', '==', partyId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const requests: JoinRequest[] = snapshot.docs.map(
          (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<JoinRequest, 'id'>),
          })
        );
        callbacks.onData(requests);
      },
      (error) => {
        callbacks.onError(error as Error);
      }
    );
  }

  async acceptJoinRequest(
    requestId: string,
    partyId: string,
    requesterId: string
  ): Promise<void> {
    // 동승 요청 상태 업데이트
    const requestRef = doc(this.db, 'joinRequests', requestId);
    await updateDoc(requestRef, { status: 'accepted' });

    // 파티에 멤버 추가
    await this.addMember(partyId, requesterId);
  }

  async declineJoinRequest(requestId: string): Promise<void> {
    const requestRef = doc(this.db, 'joinRequests', requestId);
    await updateDoc(requestRef, { status: 'declined' });
  }

  // === 파티 채팅 알림 설정 ===

  async getPartyChatMuted(partyId: string, userId: string): Promise<boolean> {
    const settingsRef = doc(
      this.db,
      'chats',
      partyId,
      'notificationSettings',
      userId
    );
    const snapshot = await getDoc(settingsRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as { muted?: boolean } | undefined;
      return !!data?.muted;
    }

    return false;
  }

  async setPartyChatMuted(
    partyId: string,
    userId: string,
    muted: boolean
  ): Promise<void> {
    const settingsRef = doc(
      this.db,
      'chats',
      partyId,
      'notificationSettings',
      userId
    );
    await setDoc(
      settingsRef,
      {
        muted,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // === 정산 관리 ===

  async startSettlement(
    partyId: string,
    settlementData: SettlementData
  ): Promise<void> {
    const partyRef = doc(this.db, this.collectionName, partyId);
    await setDoc(
      partyRef,
      {
        status: 'arrived',
        settlement: {
          status: 'pending',
          perPersonAmount: settlementData.perPersonAmount,
          members: settlementData.members,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async markMemberSettled(partyId: string, memberId: string): Promise<void> {
    const partyRef = doc(this.db, this.collectionName, partyId);
    await updateDoc(partyRef, {
      [`settlement.members.${memberId}.settled`]: true,
      [`settlement.members.${memberId}.settledAt`]: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async completeSettlement(partyId: string): Promise<void> {
    const partyRef = doc(this.db, this.collectionName, partyId);
    await updateDoc(partyRef, {
      'settlement.status': 'completed',
      status: 'ended',
      endReason: 'arrived',
      endedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}
