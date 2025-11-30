import { useState, useEffect, useCallback, useRef } from 'react';
import firestore, { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, getDocs, updateDoc, setDoc, arrayUnion, writeBatch, limit, startAfter, where } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { ChatMessage, ChatRoom } from '../types/firestore';

const MESSAGES_PER_PAGE = 30;

// 채팅방 메시지를 실시간으로 구독하는 훅 (페이징 지원)
export function useChatMessages(chatRoomId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const oldestMessageRef = useRef<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const newestMessageRef = useRef<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null);

  // 첫 로드: 최근 30개 메시지 가져오기
  const loadInitialMessages = useCallback(async (roomId: string) => {
    try {
      setLoading(true);
      setError(null);

      const messagesRef = collection(firestore(getApp()), 'chatRooms', roomId, 'messages');
      // 최근 30개를 내림차순으로 가져오기
      const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(MESSAGES_PER_PAGE));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
      setMessages([]);
        setHasMore(false);
        oldestMessageRef.current = null;
        newestMessageRef.current = null;
      return;
    }

      const fetchedMessages: ChatMessage[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: docSnap.id,
        ...docSnap.data() as ChatMessage
      }));

      // inverted FlatList를 위해 내림차순으로 그대로 유지 (최신 메시지가 배열 첫 번째)
      // reverse() 제거

      setMessages(fetchedMessages);
      setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
      
      // 가장 오래된 메시지와 가장 최신 메시지 저장
      // 내림차순이므로: 첫 번째가 최신, 마지막이 오래된
      oldestMessageRef.current = snapshot.docs[snapshot.docs.length - 1];
      newestMessageRef.current = snapshot.docs[0];

      // 실시간 구독 시작 (최신 메시지 이후의 새 메시지만 구독)
      if (newestMessageRef.current) {
        const newestMessageData = newestMessageRef.current.data();
        const realtimeQuery = query(
          messagesRef,
          orderBy('createdAt', 'asc'),
          startAfter(newestMessageData.createdAt)
        );

        realtimeUnsubscribeRef.current = onSnapshot(
          realtimeQuery,
          (realtimeSnapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
            if (realtimeSnapshot.empty) return;

            const newMessages: ChatMessage[] = realtimeSnapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
              id: docSnap.id,
              ...docSnap.data() as ChatMessage
            }));

            setMessages(prev => {
              // 중복 제거
              const existingIds = new Set(prev.map(msg => msg.id));
              const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
              
              if (uniqueNewMessages.length === 0) return prev;

              // inverted FlatList를 위해 새 메시지를 배열 앞에 추가 (최신 메시지가 첫 번째)
              const updated = [...uniqueNewMessages, ...prev];
              // 가장 최신 메시지 업데이트
              if (realtimeSnapshot.docs.length > 0) {
                newestMessageRef.current = realtimeSnapshot.docs[realtimeSnapshot.docs.length - 1];
              }
              return updated;
            });
          },
          (err) => {
            console.error('실시간 메시지 구독 실패:', err);
          }
        );
      }

    } catch (err) {
      console.error('초기 메시지 로드 실패:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 이전 메시지 로드 (위로 스크롤 시)
  const loadMore = useCallback(async () => {
    if (!chatRoomId || loadingMore || !hasMore || !oldestMessageRef.current) return;

    let oldestCreatedAt: any = null;

    try {
      setLoadingMore(true);

      const messagesRef = collection(firestore(getApp()), 'chatRooms', chatRoomId, 'messages');
      const oldestMessageData = oldestMessageRef.current.data();
      oldestCreatedAt = oldestMessageData.createdAt;

      if (!oldestCreatedAt) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      // 가장 오래된 메시지보다 이전의 메시지들을 가져오기
      // where 절을 사용하여 createdAt이 oldestCreatedAt보다 작은 메시지들을 필터링
      // 내림차순으로 정렬하여 최신 30개를 가져온 후 뒤집기
      const q = query(
        messagesRef,
        where('createdAt', '<', oldestCreatedAt),
        orderBy('createdAt', 'desc'),
        limit(MESSAGES_PER_PAGE)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      const fetchedMessages: ChatMessage[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: docSnap.id,
        ...docSnap.data() as ChatMessage
      }));

      // inverted FlatList를 위해 내림차순으로 그대로 유지 (reverse 제거)

      setMessages(prev => {
        // 중복 제거
        const existingIds = new Set(prev.map(msg => msg.id));
        const uniqueNewMessages = fetchedMessages.filter(msg => !existingIds.has(msg.id));
        
        if (uniqueNewMessages.length === 0) {
          setHasMore(false);
          return prev;
        }

        // inverted FlatList를 위해 이전 메시지를 배열 뒤에 추가 (오래된 메시지가 뒤로)
        const updated = [...prev, ...uniqueNewMessages];
        
        // 가장 오래된 메시지 업데이트 (새로 가져온 메시지 중 가장 오래된 것)
        if (snapshot.docs.length > 0) {
          // 내림차순으로 가져왔으므로 마지막 문서가 가장 오래된 것
          oldestMessageRef.current = snapshot.docs[snapshot.docs.length - 1];
        }
        
        setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
        return updated;
      });

    } catch (err: any) {
      console.error('이전 메시지 로드 실패:', err);
      console.error('에러 상세:', {
        code: err?.code,
        message: err?.message,
        oldestCreatedAt,
        chatRoomId,
      });
      
      // 인덱스 에러인 경우 명확한 메시지 표시
      if (err?.code === 'failed-precondition') {
        console.error('⚠️ Firestore 복합 인덱스가 필요할 수 있습니다. Firebase Console에서 인덱스를 생성해주세요.');
        console.error('필요한 인덱스: chatRooms/{chatRoomId}/messages 컬렉션에 createdAt 필드에 대한 복합 인덱스');
      }
      
      setError(err as Error);
      // 에러 발생 시에도 더 이상 로드할 수 없다고 표시하지 않음 (재시도 가능하도록)
    } finally {
      setLoadingMore(false);
    }
  }, [chatRoomId, loadingMore, hasMore]);

  useEffect(() => {
    if (!chatRoomId) {
      setMessages([]);
      setLoading(false);
      setHasMore(true);
      oldestMessageRef.current = null;
      newestMessageRef.current = null;
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current();
        realtimeUnsubscribeRef.current = null;
      }
      return;
    }

    loadInitialMessages(chatRoomId);

    return () => {
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current();
        realtimeUnsubscribeRef.current = null;
      }
    };
  }, [chatRoomId, loadInitialMessages]);

  // 메시지의 readBy 업데이트 (읽음 처리 후 로컬 상태 업데이트용)
  const updateMessageReadBy = useCallback((messageId: string, userId: string) => {
    setMessages(prev => {
      return prev.map(msg => {
        if (msg.id === messageId) {
          const readBy = msg.readBy || [];
          if (!readBy.includes(userId)) {
            return {
              ...msg,
              readBy: [...readBy, userId],
            };
          }
        }
        return msg;
      });
    });
  }, []);

  return { messages, loading, loadingMore, hasMore, error, loadMore, updateMessageReadBy } as const;
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

