import type { ChatRoom, ChatRoomState, ChatRoomStatesMap } from '../model/types';

export const safeToMillis = (timestamp: unknown): number | null => {
  try {
    if (!timestamp) {
      return null;
    }

    if (typeof (timestamp as any).toMillis === 'function') {
      return (timestamp as any).toMillis();
    }

    if (typeof (timestamp as any).toDate === 'function') {
      return (timestamp as any).toDate().getTime();
    }

    return new Date(timestamp as string | number | Date).getTime();
  } catch {
    return null;
  }
};

export const hasUnreadChatRoom = (
  room: ChatRoom,
  roomState: ChatRoomState | undefined,
): boolean => {
  const lastMessageMillis = safeToMillis(room.lastMessage?.timestamp);

  if (!lastMessageMillis) {
    return false;
  }

  const lastReadMillis = safeToMillis(roomState?.lastReadAt);
  return lastReadMillis ? lastMessageMillis > lastReadMillis : true;
};

export const getParticipatingChatRooms = (
  rooms: ChatRoom[],
  userId: string,
): ChatRoom[] => {
  const roomMap = new Map<string, ChatRoom>();

  rooms.forEach(room => {
    if (room.id && room.members?.includes(userId)) {
      roomMap.set(room.id, room);
    }
  });

  return Array.from(roomMap.values());
};

export const hasUnreadChatRooms = (
  rooms: ChatRoom[],
  states: ChatRoomStatesMap,
): boolean => {
  return rooms.some(room => hasUnreadChatRoom(room, room.id ? states[room.id] : undefined));
};
