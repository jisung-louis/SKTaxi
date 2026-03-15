export interface ChatRoom {
  id?: string;
  name: string;
  type: 'university' | 'department' | 'game' | 'custom';
  department?: string;
  description?: string;
  createdBy: string;
  members: string[];
  maxMembers?: number;
  isPublic: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: unknown;
  };
  unreadCount?: Record<string, number>;
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  type?: 'text' | 'image' | 'system';
  createdAt?: unknown;
  clientCreatedAt?: unknown;
  readBy?: string[];
  direction?: 'mc_to_app' | 'app_to_mc' | 'system';
  source?: 'minecraft' | 'app';
  minecraftUuid?: string | null;
  appUserDisplayName?: string | null;
}

export type ChatRoomCategory = 'all' | 'university' | 'department' | 'game' | 'custom';

export interface ChatRoomFilter {
  category: ChatRoomCategory;
  userId?: string;
  department?: string;
}

export type { PaginatedResult } from '@/shared/types/pagination';

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
