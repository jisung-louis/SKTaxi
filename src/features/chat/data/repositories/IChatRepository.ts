import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

import type {
  ChatMessage,
  ChatRoom,
  ChatRoomFilter,
  ChatRoomStatesMap,
  MessageSubscriptionCallbacks,
  PaginatedResult,
} from '../../model/types';

export interface IChatRepository {
  subscribeToChatRooms(userId: string, callbacks: SubscriptionCallbacks<ChatRoom[]>): Unsubscribe;

  subscribeToChatRoomsByCategory(
    filter: ChatRoomFilter,
    callbacks: SubscriptionCallbacks<ChatRoom[]>,
  ): Unsubscribe;

  subscribeToChatRoom(
    chatRoomId: string,
    callbacks: SubscriptionCallbacks<ChatRoom | null>,
  ): Unsubscribe;

  getChatRoom(chatRoomId: string): Promise<ChatRoom | null>;

  createChatRoom(chatRoom: Omit<ChatRoom, 'id'>): Promise<string>;

  joinChatRoom(chatRoomId: string, userId: string): Promise<void>;

  leaveChatRoom(chatRoomId: string, userId: string): Promise<void>;

  getInitialMessages(
    chatRoomId: string,
    limit: number,
  ): Promise<PaginatedResult<ChatMessage>>;

  getOlderMessages(
    chatRoomId: string,
    cursor: unknown,
    limit: number,
  ): Promise<PaginatedResult<ChatMessage>>;

  subscribeToNewMessages(
    chatRoomId: string,
    afterTimestamp: unknown,
    callbacks: MessageSubscriptionCallbacks,
  ): Unsubscribe;

  sendMessage(
    chatRoomId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt'>,
  ): Promise<void>;

  getNotificationSetting(chatRoomId: string, userId: string): Promise<boolean>;

  updateNotificationSetting(
    chatRoomId: string,
    userId: string,
    enabled: boolean,
  ): Promise<void>;

  subscribeToChatRoomStates(
    userId: string,
    callbacks: SubscriptionCallbacks<ChatRoomStatesMap>,
  ): Unsubscribe;

  subscribeToChatRoomNotifications(
    userId: string,
    callbacks: SubscriptionCallbacks<Record<string, boolean>>,
  ): Unsubscribe;

  updateLastReadAt(userId: string, chatRoomId: string): Promise<void>;
}
