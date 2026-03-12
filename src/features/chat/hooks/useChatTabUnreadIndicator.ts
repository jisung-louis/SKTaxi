import { useMemo } from 'react';

import { useAuth } from '@/features/auth';

import {
  getParticipatingChatRooms,
  hasUnreadChatRooms,
} from '../services/unreadStateService';

import { useChatRoomStates } from './useChatRoomStates';
import { useChatRooms } from './useChatRooms';

export const useChatTabUnreadIndicator = () => {
  const { user } = useAuth();
  const { states } = useChatRoomStates();
  const { chatRooms: allChatRooms } = useChatRooms('all');
  const { chatRooms: customChatRooms } = useChatRooms('custom');

  const hasUnread = useMemo(() => {
    if (!user?.uid) {
      return false;
    }

    const joinedRooms = getParticipatingChatRooms(
      [...allChatRooms, ...customChatRooms],
      user.uid,
    );

    return hasUnreadChatRooms(joinedRooms, states);
  }, [allChatRooms, customChatRooms, states, user?.uid]);

  return {
    hasUnread,
    totalUnreadCount: hasUnread ? 1 : 0,
  };
};
