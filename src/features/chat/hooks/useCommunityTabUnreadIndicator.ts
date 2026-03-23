import {useMemo} from 'react';

import {useChatRooms} from './useChatRooms';

export const useCommunityTabUnreadIndicator = () => {
  const {chatRooms} = useChatRooms('all');

  const totalUnreadCount = useMemo(
    () =>
      chatRooms.reduce(
        (sum, room) => sum + (room.unreadCount ?? 0),
        0,
      ),
    [chatRooms],
  );

  return {
    hasUnread: totalUnreadCount > 0,
    totalUnreadCount,
  };
};
