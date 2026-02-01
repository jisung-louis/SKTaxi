// SKTaxi: Chat Repository Mock 구현체
// 테스트 및 개발용 Mock 데이터 제공

import { ChatMessage, ChatRoom } from '../../types/firestore';
import {
  IChatRepository,
  ChatRoomFilter,
  PaginatedResult,
  MessageSubscriptionCallbacks,
  ChatRoomStatesMap,
} from '../interfaces/IChatRepository';
import { Unsubscribe, SubscriptionCallbacks } from '../interfaces/IPartyRepository';

/**
 * Mock Chat Repository 구현체
 */
export class MockChatRepository implements IChatRepository {
  private chatRooms: Map<string, ChatRoom> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private notificationSettings: Map<string, Map<string, boolean>> = new Map();
  private lastReadTimestamps: Map<string, Map<string, Date>> = new Map();

  constructor() {
    // 기본 테스트 채팅방 추가
    this.chatRooms.set('university-chat', {
      id: 'university-chat',
      name: '성결대 전체 채팅방',
      type: 'university',
      members: ['user1', 'user2'],
      createdAt: new Date() as any,
    });
  }

  subscribeToChatRooms(
    userId: string,
    callbacks: SubscriptionCallbacks<ChatRoom[]>
  ): Unsubscribe {
    const rooms = Array.from(this.chatRooms.values()).filter(
      room => room.members?.includes(userId)
    );
    setTimeout(() => callbacks.onData(rooms), 10);
    return () => {};
  }

  subscribeToChatRoomsByCategory(
    filter: ChatRoomFilter,
    callbacks: SubscriptionCallbacks<ChatRoom[]>
  ): Unsubscribe {
    let rooms = Array.from(this.chatRooms.values());
    if (filter.category !== 'all') {
      rooms = rooms.filter(r => r.type === filter.category);
    }
    setTimeout(() => callbacks.onData(rooms), 10);
    return () => {};
  }

  subscribeToChatRoom(
    chatRoomId: string,
    callbacks: SubscriptionCallbacks<ChatRoom | null>
  ): Unsubscribe {
    const room = this.chatRooms.get(chatRoomId) || null;
    setTimeout(() => callbacks.onData(room), 10);
    return () => {};
  }

  async createChatRoom(chatRoom: Omit<ChatRoom, 'id'>): Promise<string> {
    const id = `chat-${Date.now()}`;
    this.chatRooms.set(id, { ...chatRoom, id } as ChatRoom);
    return id;
  }

  async joinChatRoom(chatRoomId: string, userId: string): Promise<void> {
    const room = this.chatRooms.get(chatRoomId);
    if (room && !room.members?.includes(userId)) {
      room.members = [...(room.members || []), userId];
      this.chatRooms.set(chatRoomId, room);
    }
  }

  async leaveChatRoom(chatRoomId: string, userId: string): Promise<void> {
    const room = this.chatRooms.get(chatRoomId);
    if (room) {
      room.members = (room.members || []).filter(id => id !== userId);
      this.chatRooms.set(chatRoomId, room);
    }
  }

  async getInitialMessages(
    chatRoomId: string,
    limit: number
  ): Promise<PaginatedResult<ChatMessage>> {
    const msgs = (this.messages.get(chatRoomId) || []).slice(0, limit);
    return {
      data: msgs,
      hasMore: (this.messages.get(chatRoomId) || []).length > limit,
      cursor: msgs.length > 0 ? msgs[msgs.length - 1].createdAt : null,
    };
  }

  async getOlderMessages(
    chatRoomId: string,
    cursor: unknown,
    limit: number
  ): Promise<PaginatedResult<ChatMessage>> {
    const allMsgs = this.messages.get(chatRoomId) || [];
    return {
      data: allMsgs.slice(0, limit),
      hasMore: false,
      cursor: null,
    };
  }

  subscribeToNewMessages(
    chatRoomId: string,
    afterTimestamp: unknown,
    callbacks: MessageSubscriptionCallbacks
  ): Unsubscribe {
    // Mock: 새 메시지 없음
    setTimeout(() => callbacks.onNewMessages([]), 10);
    return () => {};
  }

  async sendMessage(
    chatRoomId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt'>
  ): Promise<void> {
    const roomMessages = this.messages.get(chatRoomId) || [];
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      createdAt: new Date() as any,
    };
    this.messages.set(chatRoomId, [newMessage, ...roomMessages]);
  }

  async getNotificationSetting(chatRoomId: string, userId: string): Promise<boolean> {
    const settings = this.notificationSettings.get(chatRoomId);
    return settings?.get(userId) ?? true;
  }

  async updateNotificationSetting(
    chatRoomId: string,
    userId: string,
    enabled: boolean
  ): Promise<void> {
    if (!this.notificationSettings.has(chatRoomId)) {
      this.notificationSettings.set(chatRoomId, new Map());
    }
    this.notificationSettings.get(chatRoomId)!.set(userId, enabled);
  }

  subscribeToChatRoomStates(
    userId: string,
    callbacks: SubscriptionCallbacks<ChatRoomStatesMap>
  ): Unsubscribe {
    const states: ChatRoomStatesMap = {};
    this.lastReadTimestamps.forEach((userMap, chatRoomId) => {
      const lastRead = userMap.get(userId);
      if (lastRead) {
        states[chatRoomId] = { lastReadAt: lastRead };
      }
    });
    setTimeout(() => callbacks.onData(states), 10);
    return () => {};
  }

  subscribeToChatRoomNotifications(
    userId: string,
    callbacks: SubscriptionCallbacks<Record<string, boolean>>
  ): Unsubscribe {
    const result: Record<string, boolean> = {};
    this.notificationSettings.forEach((userMap, chatRoomId) => {
      result[chatRoomId] = userMap.get(userId) ?? true;
    });
    setTimeout(() => callbacks.onData(result), 10);
    return () => {};
  }

  async updateLastReadAt(userId: string, chatRoomId: string): Promise<void> {
    if (!this.lastReadTimestamps.has(chatRoomId)) {
      this.lastReadTimestamps.set(chatRoomId, new Map());
    }
    this.lastReadTimestamps.get(chatRoomId)!.set(userId, new Date());
  }

  // 테스트용 헬퍼 메서드
  addMockChatRoom(room: ChatRoom): void {
    this.chatRooms.set(room.id, room);
  }

  addMockMessage(chatRoomId: string, message: ChatMessage): void {
    const msgs = this.messages.get(chatRoomId) || [];
    this.messages.set(chatRoomId, [message, ...msgs]);
  }

  clearMockData(): void {
    this.chatRooms.clear();
    this.messages.clear();
    this.notificationSettings.clear();
    this.lastReadTimestamps.clear();
  }
}
