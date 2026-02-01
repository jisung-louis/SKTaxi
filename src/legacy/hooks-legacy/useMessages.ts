/**
 * @deprecated 이 훅은 Firebase 직접 접근으로 DIP 원칙 위반.
 * 새로운 코드에서는 hooks/chat/useChatMessages 사용 권장.
 * import { useChatMessages } from '../hooks/chat';
 */

import { useState, useEffect } from 'react';
import firestore, { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { Message } from '../../types/firestore';
import { logEvent } from '../../lib/analytics';

// SKTaxi: 특정 파티의 메시지를 실시간으로 구독하는 훅
export function useMessages(partyId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!partyId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const messagesRef = collection(firestore(getApp()), 'chats', partyId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      const fetchedMessages: Message[] = querySnapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: docSnap.id,
        ...docSnap.data() as Message
      }));
      setMessages(fetchedMessages);
      setLoading(false);
    }, (err) => {
      console.error("SKTaxi useMessages: Error fetching messages:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [partyId]);

  return { messages, loading, error } as const;
}

// SKTaxi: 메시지 전송 함수
export async function sendMessage(partyId: string, text: string): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  if (!text.trim()) {
    throw new Error('메시지를 입력해주세요.');
  }

  try {
    const messagesRef = collection(firestore(getApp()), 'chats', partyId, 'messages');

    // 사용자 정보 조회
    const userDoc = await firestore(getApp()).collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const senderName = userData?.displayName || userData?.email || '익명';

    const messageData: Omit<Message, 'id'> = {
      partyId,
      senderId: user.uid,
      senderName,
      text: text.trim(),
      type: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(messagesRef, messageData);

    // Analytics: 채팅 메시지 전송 이벤트 로깅
    await logEvent('chat_message_sent', {
      party_id: partyId,
      message_length: text.trim().length,
    });
  } catch (error) {
    console.error('SKTaxi sendMessage: Error sending message:', error);
    throw error;
  }
}

// SKTaxi: 시스템 메시지 전송 함수
export async function sendSystemMessage(partyId: string, text: string): Promise<void> {
  try {
    const messagesRef = collection(firestore(getApp()), 'chats', partyId, 'messages');

    const messageData: Omit<Message, 'id'> = {
      partyId,
      senderId: 'system',
      senderName: '시스템',
      text,
      type: 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(messagesRef, messageData);
  } catch (error) {
    console.error('SKTaxi sendSystemMessage: Error sending system message:', error);
    throw error;
  }
}

// SKTaxi: 계좌 정보 메시지 전송 함수
export async function sendAccountMessage(
  partyId: string,
  accountData: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    hideName: boolean;
  }
): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const messagesRef = collection(firestore(getApp()), 'chats', partyId, 'messages');

    // 사용자 정보 조회
    const userDoc = await firestore(getApp()).collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const senderName = userData?.displayName || userData?.email || '익명';

    const messageData: Omit<Message, 'id'> = {
      partyId,
      senderId: user.uid,
      senderName,
      text: '', // account 타입은 text 대신 accountData 사용
      type: 'account',
      accountData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(messagesRef, messageData);
  } catch (error) {
    console.error('SKTaxi sendAccountMessage: Error sending account message:', error);
    throw error;
  }
}

// SKTaxi: 도착 메시지 전송 함수
export async function sendArrivedMessage(
  partyId: string,
  arrivalData: {
    taxiFare: number;
    perPerson: number;
    memberCount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    hideName: boolean;
  }
): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const messagesRef = collection(firestore(getApp()), 'chats', partyId, 'messages');

    // 사용자 정보 조회
    const userDoc = await firestore(getApp()).collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const senderName = userData?.displayName || userData?.email || '익명';

    const messageData: Omit<Message, 'id'> = {
      partyId,
      senderId: user.uid,
      senderName,
      text: '', // arrived 타입은 text 대신 arrivalData 사용
      type: 'arrived',
      arrivalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(messagesRef, messageData);
  } catch (error) {
    console.error('SKTaxi sendArrivedMessage: Error sending arrived message:', error);
    throw error;
  }
}

// SKTaxi: 동승 종료 메시지 전송 함수
export async function sendEndMessage(partyId: string, partyArrived: boolean): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const messagesRef = collection(firestore(getApp()), 'chats', partyId, 'messages');

    // 사용자 정보 조회
    const userDoc = await firestore(getApp()).collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const senderName = userData?.displayName || userData?.email || '익명';

    const messageData: Omit<Message, 'id'> = {
      partyId,
      senderId: user.uid,
      senderName,
      text: partyArrived ? '동승이 종료되었어요.' : '파티가 해체되었어요.',
      type: 'end',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(messagesRef, messageData);
  } catch (error) {
    console.error('SKTaxi sendEndMessage: Error sending end message:', error);
    throw error;
  }
}
