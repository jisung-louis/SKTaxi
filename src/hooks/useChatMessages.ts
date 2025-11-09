import { useState, useEffect } from 'react';
import firestore, { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, getDocs, updateDoc, setDoc, arrayUnion, writeBatch } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { ChatMessage, ChatRoom } from '../types/firestore';

// 채팅방 메시지를 실시간으로 구독하는 훅
export function useChatMessages(chatRoomId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chatRoomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const messagesRef = collection(firestore(getApp()), 'chatRooms', chatRoomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      const fetchedMessages: ChatMessage[] = querySnapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: docSnap.id,
        ...docSnap.data() as ChatMessage
      }));
      setMessages(fetchedMessages);
      setLoading(false);
    }, (err) => {
      console.error('채팅 메시지 구독 실패:', err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  return { messages, loading, error } as const;
}

// 채팅방에 최초 접속 시 members 배열에 추가
export async function joinChatRoom(chatRoomId: string): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const chatRoomRef = doc(firestore(getApp()), 'chatRooms', chatRoomId);
    const chatRoomSnap = await chatRoomRef.get();
    
    if (!chatRoomSnap.exists()) {
      throw new Error('채팅방을 찾을 수 없습니다.');
    }

    const chatRoomData = chatRoomSnap.data() as ChatRoom;
    
    // 이미 멤버인지 확인
    if (chatRoomData.members?.includes(user.uid)) {
      return; // 이미 멤버이면 아무것도 하지 않음
    }

    // members 배열에 추가
    await updateDoc(chatRoomRef, {
      members: arrayUnion(user.uid),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ 채팅방 참여 완료:', chatRoomId);
  } catch (error) {
    console.error('채팅방 참여 실패:', error);
    throw error;
  }
}

// 메시지 전송 함수
export async function sendChatMessage(chatRoomId: string, text: string): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  if (!text.trim()) {
    throw new Error('메시지를 입력해주세요.');
  }

  try {
    // 채팅방 정보 조회
    const chatRoomRef = doc(firestore(getApp()), 'chatRooms', chatRoomId);
    const chatRoomSnap = await chatRoomRef.get();
    
    if (!chatRoomSnap.exists()) {
      throw new Error('채팅방을 찾을 수 없습니다.');
    }

    const chatRoomData = chatRoomSnap.data() as ChatRoom;
    
    // 멤버인지 확인
    if (!chatRoomData.members?.includes(user.uid)) {
      throw new Error('채팅방 멤버가 아닙니다.');
    }

    // 사용자 정보 조회
    const userDoc = await firestore(getApp()).collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const senderName = userData?.displayName || userData?.email || '익명';

    const messagesRef = collection(firestore(getApp()), 'chatRooms', chatRoomId, 'messages');
    
    const messageData: Omit<ChatMessage, 'id'> = {
      text: text.trim(),
      senderId: user.uid,
      senderName,
      type: 'text',
      createdAt: serverTimestamp(),
      readBy: [user.uid], // 전송자는 자동으로 읽음 처리
    };

    await addDoc(messagesRef, messageData);

    // 채팅방의 lastMessage 업데이트
    await updateDoc(chatRoomRef, {
      lastMessage: {
        text: text.trim(),
        senderId: user.uid,
        senderName,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });

    console.log('✅ 메시지 전송 완료');
  } catch (error) {
    console.error('메시지 전송 실패:', error);
    throw error;
  }
}

// 채팅방 알림 설정 조회
export async function getChatRoomNotificationSetting(chatRoomId: string): Promise<boolean> {
  const user = auth(getApp()).currentUser;
  if (!user) return true; // 기본값: 알림 켜짐

  try {
    const settingRef = doc(firestore(getApp()), 'users', user.uid, 'chatRoomNotifications', chatRoomId);
    const settingSnap = await settingRef.get();
    
    if (!settingSnap.exists()) {
      return true; // 기본값: 알림 켜짐
    }

    const data = settingSnap.data();
    return data?.enabled !== false; // undefined나 true면 알림 켜짐
  } catch (error) {
    console.error('알림 설정 조회 실패:', error);
    return true; // 기본값: 알림 켜짐
  }
}

// 채팅방 알림 설정 업데이트
export async function updateChatRoomNotificationSetting(chatRoomId: string, enabled: boolean): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const settingRef = doc(firestore(getApp()), 'users', user.uid, 'chatRoomNotifications', chatRoomId);
    
    await updateDoc(settingRef, {
      enabled,
      updatedAt: serverTimestamp(),
    }).catch(async () => {
      // 문서가 없으면 생성
      await setDoc(settingRef, {
        enabled,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    console.log('✅ 알림 설정 업데이트 완료:', enabled);
  } catch (error) {
    console.error('알림 설정 업데이트 실패:', error);
    throw error;
  }
}

// 채팅방 읽음 처리 (unreadCount를 0으로 리셋하고 모든 메시지의 readBy 업데이트)
export async function markChatRoomAsRead(chatRoomId: string): Promise<void> {
  const user = auth(getApp()).currentUser;
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const chatRoomRef = doc(firestore(getApp()), 'chatRooms', chatRoomId);
    const chatRoomSnap = await chatRoomRef.get();
    
    if (!chatRoomSnap.exists()) {
      throw new Error('채팅방을 찾을 수 없습니다.');
    }

    const chatRoomData = chatRoomSnap.data() as ChatRoom;
    
    // 멤버인지 확인
    if (!chatRoomData.members?.includes(user.uid)) {
      throw new Error('채팅방 멤버가 아닙니다.');
    }

    // unreadCount 업데이트: 현재 사용자의 unreadCount를 0으로 설정
    const currentUnreadCount = chatRoomData.unreadCount || {};
    const updatedUnreadCount = {
      ...currentUnreadCount,
      [user.uid]: 0,
    };

    await updateDoc(chatRoomRef, {
      unreadCount: updatedUnreadCount,
    });

    // 모든 메시지의 readBy 배열에 현재 사용자 추가
    const messagesRef = collection(firestore(getApp()), 'chatRooms', chatRoomId, 'messages');
    const messagesSnap = await getDocs(messagesRef);
    
    // Firestore 배치 제한(500개)을 고려하여 여러 번 실행
    const batches: Promise<void>[] = [];
    let currentBatch = writeBatch(firestore(getApp()));
    let currentBatchCount = 0;
    let totalCount = 0;

    messagesSnap.forEach((messageDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      const messageData = messageDoc.data() as ChatMessage;
      
      // 시스템 메시지는 제외
      if (messageData.type === 'system') {
        return;
      }

      // 이미 readBy에 포함되어 있으면 스킵
      const readBy = messageData.readBy || [];
      if (readBy.includes(user.uid)) {
        return;
      }

      const messageRef = doc(firestore(getApp()), 'chatRooms', chatRoomId, 'messages', messageDoc.id);
      currentBatch.update(messageRef, {
        readBy: arrayUnion(user.uid),
      });
      
      currentBatchCount++;
      totalCount++;

      // 배치 제한에 도달하면 커밋하고 새 배치 시작
      if (currentBatchCount >= 500) {
        batches.push(currentBatch.commit());
        currentBatch = writeBatch(firestore(getApp()));
        currentBatchCount = 0;
      }
    });

    // 마지막 배치 커밋
    if (currentBatchCount > 0) {
      batches.push(currentBatch.commit());
    }

    // 모든 배치 완료 대기
    if (batches.length > 0) {
      await Promise.all(batches);
      console.log(`✅ ${totalCount}개 메시지 읽음 처리 완료`);
    }

    console.log('✅ 채팅방 읽음 처리 완료:', chatRoomId);
  } catch (error) {
    console.error('채팅방 읽음 처리 실패:', error);
    throw error;
  }
}

