import { useState, useEffect } from 'react';
import firestore, { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { Message } from '../types/firestore';

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

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: Message[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Message
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
