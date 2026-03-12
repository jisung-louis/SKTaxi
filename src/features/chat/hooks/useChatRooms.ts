import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';

import type { ChatRoom, ChatRoomCategory } from '../model/types';

import { useChatRepository } from './useChatRepository';

export type { ChatRoomCategory } from '../model/types';

export const useChatRooms = (category: ChatRoomCategory) => {
  const { user } = useAuth();
  const chatRepository = useChatRepository();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

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
        onData: rooms => {
          setChatRooms(rooms);
          setLoading(false);
        },
        onError: err => {
          console.error('채팅방 목록 구독 실패:', err);
          setError(err);
          setChatRooms([]);
          setLoading(false);
        },
      },
    );

    return () => unsubscribe();
  }, [category, chatRepository, user?.department, user?.uid]);

  return { chatRooms, loading, error } as const;
};
