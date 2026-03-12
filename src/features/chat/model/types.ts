import type { ChatMessage as LegacyChatMessage, ChatRoom as LegacyChatRoom } from '@/types/firestore';

export type ChatRoom = LegacyChatRoom;
export type ChatMessage = LegacyChatMessage;

export type ChatRoomCategory = 'all' | 'university' | 'department' | 'game' | 'custom';

export interface ChatRoomFilter {
  category: ChatRoomCategory;
  userId?: string;
  department?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  cursor: unknown;
}

export interface MessageSubscriptionCallbacks {
  onNewMessages: (messages: ChatMessage[]) => void;
  onError: (error: Error) => void;
}

export interface ChatRoomState {
  lastReadAt?: unknown;
}

export type ChatRoomStatesMap = Record<string, ChatRoomState>;

export interface ChatRoomListItem extends ChatRoom {
  displayName?: string;
  notificationEnabled?: boolean;
}

export interface ChatRoomNotificationPayload {
  title: string;
  body: string;
  chatRoomId: string;
}

export interface ChatRoomServerInfo {
  currentPlayers: number | null;
  maxPlayers: number | null;
  online: boolean | null;
  serverUrl: string | null;
  version: string | null;
}
