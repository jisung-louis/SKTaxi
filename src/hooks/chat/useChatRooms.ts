// SKTaxi: 채팅방 목록을 실시간으로 구독하는 훅 (Repository 패턴 적용)

import { useState, useEffect } from 'react';
import { ChatRoom } from '../../types/firestore';
import { useAuth } from '../auth';
import { useChatRepository } from '../../di/useRepository';
import type { ChatRoomCategory } from '../../repositories/interfaces/IChatRepository';

export type { ChatRoomCategory };

export function useChatRooms(category: ChatRoomCategory) {
  const { user } = useAuth();
  const chatRepository = useChatRepository();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // custom/department 카테고리는 사용자 정보 필요
    if (category === 'custom' && !user?.uid) {
      setChatRooms([]);
      setLoading(false);
      return;
    }

    if (category === 'department' && !user?.department) {
      setChatRooms([]);
      setLoading(false);
      return;
    }

    const unsubscribe = chatRepository.subscribeToChatRoomsByCategory(
      {
        category,
        userId: user?.uid,
        department: user?.department ?? undefined,
      },
      {
        onData: (rooms) => {
          setChatRooms(rooms);
          setLoading(false);
        },
        onError: (err) => {
          console.error('채팅방 목록 구독 실패:', err);
          setError(err);
          setChatRooms([]);
          setLoading(false);
        },
      }
    );

    return () => {
      unsubscribe();
    };
  }, [category, user?.uid, user?.department, chatRepository]);

  return { chatRooms, loading, error } as const;
}
