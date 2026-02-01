// SKTaxi: Chat Repository Firestore 구현체
// Phase 3에서 완전히 구현 예정, 현재는 스텁

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
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  where,
  limit,
  startAfter,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

import { ChatMessage, ChatRoom } from '../../types/firestore';
import {
  IChatRepository,
  PaginatedResult,
  MessageSubscriptionCallbacks,
  ChatRoomFilter,
  ChatRoomStatesMap,
} from '../interfaces/IChatRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../interfaces/IPartyRepository';

/**
 * Firestore 기반 Chat Repository 구현체
 */
export class FirestoreChatRepository implements IChatRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly chatRoomsCollection = 'chatRooms';

  constructor() {
    this.db = firestore(getApp());
  }

  // === 채팅방 관련 ===

  subscribeToChatRooms(
    userId: string,
    callbacks: SubscriptionCallbacks<ChatRoom[]>
  ): Unsubscribe {
    const q = query(
      collection(this.db, this.chatRoomsCollection),
      where('members', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const rooms: ChatRoom[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ChatRoom, 'id'>),
        }));
        callbacks.onData(rooms);
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  subscribeToChatRoomsByCategory(
    filter: ChatRoomFilter,
    callbacks: SubscriptionCallbacks<ChatRoom[]>
  ): Unsubscribe {
    const chatRoomsRef = collection(this.db, this.chatRoomsCollection);
    let q: FirebaseFirestoreTypes.Query;

    switch (filter.category) {
      case 'university':
        q = query(
          chatRoomsRef,
          where('type', '==', 'university'),
          where('isPublic', '==', true),
          orderBy('updatedAt', 'desc')
        );
        break;

      case 'department':
        if (!filter.department) {
          // department가 없으면 빈 배열 반환
          callbacks.onData([]);
          return () => {};
        }
        q = query(
          chatRoomsRef,
          where('type', '==', 'department'),
          where('department', '==', filter.department),
          where('isPublic', '==', true),
          orderBy('updatedAt', 'desc')
        );
        break;

      case 'game':
        q = query(
          chatRoomsRef,
          where('type', '==', 'game'),
          where('isPublic', '==', true),
          orderBy('updatedAt', 'desc')
        );
        break;

      case 'custom':
        if (!filter.userId) {
          callbacks.onData([]);
          return () => {};
        }
        q = query(
          chatRoomsRef,
          where('type', '==', 'custom'),
          where('members', 'array-contains', filter.userId),
          orderBy('updatedAt', 'desc')
        );
        break;

      case 'all':
      default:
        q = query(
          chatRoomsRef,
          where('isPublic', '==', true),
          orderBy('updatedAt', 'desc')
        );
        break;
    }

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const rooms: ChatRoom[] = snapshot.docs.map(
          (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ChatRoom, 'id'>),
          })
        );
        callbacks.onData(rooms);
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  subscribeToChatRoom(
    chatRoomId: string,
    callbacks: SubscriptionCallbacks<ChatRoom | null>
  ): Unsubscribe {
    const docRef = doc(this.db, this.chatRoomsCollection, chatRoomId);

    return onSnapshot(
      docRef,
      (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
        if (snapshot.exists()) {
          callbacks.onData({
            id: snapshot.id,
            ...(snapshot.data() as Omit<ChatRoom, 'id'>),
          });
        } else {
          callbacks.onData(null);
        }
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async createChatRoom(chatRoom: Omit<ChatRoom, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.db, this.chatRoomsCollection), {
      ...chatRoom,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async joinChatRoom(chatRoomId: string, userId: string): Promise<void> {
    const docRef = doc(this.db, this.chatRoomsCollection, chatRoomId);
    await updateDoc(docRef, {
      members: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
  }

  async leaveChatRoom(chatRoomId: string, userId: string): Promise<void> {
    const docRef = doc(this.db, this.chatRoomsCollection, chatRoomId);
    await updateDoc(docRef, {
      members: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });
  }

  // === 메시지 관련 ===

  async getInitialMessages(
    chatRoomId: string,
    messageLimit: number
  ): Promise<PaginatedResult<ChatMessage>> {
    const messagesRef = collection(
      this.db,
      this.chatRoomsCollection,
      chatRoomId,
      'messages'
    );
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(messageLimit));
    const snapshot = await getDocs(q);

    const messages: ChatMessage[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
      id: docSnap.id,
      ...(docSnap.data() as ChatMessage),
    }));

    return {
      data: messages,
      hasMore: snapshot.docs.length === messageLimit,
      cursor: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  }

  async getOlderMessages(
    chatRoomId: string,
    cursor: unknown,
    messageLimit: number
  ): Promise<PaginatedResult<ChatMessage>> {
    const messagesRef = collection(
      this.db,
      this.chatRoomsCollection,
      chatRoomId,
      'messages'
    );

    const cursorDoc = cursor as FirebaseFirestoreTypes.QueryDocumentSnapshot;
    const cursorData = cursorDoc?.data?.();

    if (!cursorData?.createdAt) {
      return { data: [], hasMore: false, cursor: null };
    }

    const q = query(
      messagesRef,
      where('createdAt', '<', cursorData.createdAt),
      orderBy('createdAt', 'desc'),
      limit(messageLimit)
    );
    const snapshot = await getDocs(q);

    const messages: ChatMessage[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
      id: docSnap.id,
      ...(docSnap.data() as ChatMessage),
    }));

    return {
      data: messages,
      hasMore: snapshot.docs.length === messageLimit,
      cursor: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  }

  subscribeToNewMessages(
    chatRoomId: string,
    afterTimestamp: unknown,
    callbacks: MessageSubscriptionCallbacks
  ): Unsubscribe {
    const messagesRef = collection(
      this.db,
      this.chatRoomsCollection,
      chatRoomId,
      'messages'
    );

    const q = query(
      messagesRef,
      orderBy('createdAt', 'asc'),
      startAfter(afterTimestamp)
    );

    return onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        if (snapshot.empty) {return;}

        const newMessages: ChatMessage[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
          id: docSnap.id,
          ...(docSnap.data() as ChatMessage),
        }));

        callbacks.onNewMessages(newMessages);
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async sendMessage(
    chatRoomId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt'>
  ): Promise<void> {
    const messagesRef = collection(
      this.db,
      this.chatRoomsCollection,
      chatRoomId,
      'messages'
    );

    await addDoc(messagesRef, {
      ...message,
      createdAt: serverTimestamp(),
      clientCreatedAt: new Date(),
    });

    // 채팅방 lastMessage 업데이트
    const chatRoomRef = doc(this.db, this.chatRoomsCollection, chatRoomId);
    await updateDoc(chatRoomRef, {
      lastMessage: {
        text: message.text,
        senderId: message.senderId,
        senderName: message.senderName,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  }

  // === 알림 설정 ===

  async getNotificationSetting(
    chatRoomId: string,
    userId: string
  ): Promise<boolean> {
    const settingRef = doc(
      this.db,
      'users',
      userId,
      'chatRoomNotifications',
      chatRoomId
    );
    const snapshot = await getDoc(settingRef);

    if (!snapshot.exists()) {return true;}
    return snapshot.data()?.enabled !== false;
  }

  async updateNotificationSetting(
    chatRoomId: string,
    userId: string,
    enabled: boolean
  ): Promise<void> {
    const settingRef = doc(
      this.db,
      'users',
      userId,
      'chatRoomNotifications',
      chatRoomId
    );

    await setDoc(
      settingRef,
      {
        enabled,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // === 채팅방 상태 관련 (ChatListScreen 지원) ===

  subscribeToChatRoomStates(
    userId: string,
    callbacks: SubscriptionCallbacks<ChatRoomStatesMap>
  ): Unsubscribe {
    const statesRef = collection(this.db, 'users', userId, 'chatRoomStates');

    return onSnapshot(
      statesRef,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const states: ChatRoomStatesMap = {};
        snapshot.docs.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const data = docSnap.data();
          states[docSnap.id] = {
            lastReadAt: data.lastReadAt,
          };
        });
        callbacks.onData(states);
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  subscribeToChatRoomNotifications(
    userId: string,
    callbacks: SubscriptionCallbacks<Record<string, boolean>>
  ): Unsubscribe {
    const notificationsRef = collection(
      this.db,
      'users',
      userId,
      'chatRoomNotifications'
    );

    return onSnapshot(
      notificationsRef,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        const settings: Record<string, boolean> = {};
        snapshot.docs.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const data = docSnap.data();
          // enabled가 명시적으로 false가 아니면 기본적으로 true
          settings[docSnap.id] = data.enabled !== false;
        });
        callbacks.onData(settings);
      },
      (error) => callbacks.onError(error as Error)
    );
  }

  async updateLastReadAt(userId: string, chatRoomId: string): Promise<void> {
    const stateRef = doc(this.db, 'users', userId, 'chatRoomStates', chatRoomId);
    await setDoc(
      stateRef,
      {
        lastReadAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}
