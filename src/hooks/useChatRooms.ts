import { useState, useEffect } from 'react';
import firestore, { collection, query, where, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { ChatRoom } from '../types/firestore';
import { useAuth } from './useAuth';

export type ChatRoomCategory = 'all' | 'university' | 'department' | 'custom';

// SKTaxi: 채팅방 목록을 실시간으로 구독하는 훅
export function useChatRooms(category: ChatRoomCategory) {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const db = firestore(getApp());
    let q: FirebaseFirestoreTypes.Query;

    switch (category) {
      case 'university':
        // 전체 채팅방: type이 'university'이고 공개인 것
        q = query(
          collection(db, 'chatRooms'),
          where('type', '==', 'university'),
          where('isPublic', '==', true),
          orderBy('updatedAt', 'desc')
        );
        break;

      case 'department':
        // 학과 채팅방: type이 'department'이고 사용자 학과와 일치하는 것
        if (!user?.department) {
          setChatRooms([]);
          setLoading(false);
          return;
        }
        q = query(
          collection(db, 'chatRooms'),
          where('type', '==', 'department'),
          where('department', '==', user.department),
          where('isPublic', '==', true),
          orderBy('updatedAt', 'desc')
        );
        break;

      case 'custom':
        // 내 채팅방: type이 'custom'이고 사용자가 멤버인 것
        if (!user?.uid) {
          setChatRooms([]);
          setLoading(false);
          return;
        }
        q = query(
          collection(db, 'chatRooms'),
          where('type', '==', 'custom'),
          where('members', 'array-contains', user.uid),
          orderBy('updatedAt', 'desc')
        );
        break;

      case 'all':
      default:
        // 전체 채팅방 목록: 공개 채팅방 모두
        q = query(
          collection(db, 'chatRooms'),
          where('isPublic', '==', true),
          orderBy('updatedAt', 'desc')
        );
        break;
    }

    let unsubscribe: (() => void) | null = null;
    
    try {
      unsubscribe = onSnapshot(
        q,
        (snap: FirebaseFirestoreTypes.QuerySnapshot) => {
          const rooms: ChatRoom[] = snap.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ChatRoom, 'id'>),
          }));
          setChatRooms(rooms);
          setLoading(false);
        },
        (err) => {
          console.error('채팅방 목록 구독 실패:', err);
          setError(err);
          setChatRooms([]); // 에러 발생 시 빈 배열로 설정
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('채팅방 목록 쿼리 생성 실패:', err);
      setError(err);
      setChatRooms([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [category, user?.uid, user?.department]);

  return { chatRooms, loading, error } as const;
}

