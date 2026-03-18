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
import { COMMUNITY_CHAT_DETAIL_SOURCE_MOCK } from '../../mocks/chatDetail.mock';
import type { IChatRepository } from './IChatRepository';

const rooms = new Map<string, ChatRoom>();
const messagesByRoom = new Map<string, ChatMessage[]>();
const roomSubscribers = new Set<{
  userId: string;
  callbacks: SubscriptionCallbacks<ChatRoom[]>;
}>();
const categorySubscribers = new Set<{
  filter: ChatRoomFilter;
  callbacks: SubscriptionCallbacks<ChatRoom[]>;
}>();
const roomDetailSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<ChatRoom | null>>
>();
const newMessageSubscribers = new Map<
  string,
  Set<{
    afterTimestamp: number;
    callbacks: MessageSubscriptionCallbacks;
  }>
>();
const stateSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<ChatRoomStatesMap>>
>();
const notificationSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<Record<string, boolean>>>
>();
const notificationSettings = new Map<string, boolean>();
const chatStates = new Map<string, ChatRoomStatesMap>();

const keyForRoomSetting = (chatRoomId: string, userId: string) => `${chatRoomId}:${userId}`;

const toTimestamp = (value: unknown) => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return new Date(value).getTime();
  }

  return 0;
};

const cloneRoom = (room: ChatRoom): ChatRoom => ({
  ...room,
  members: [...room.members],
  unreadCount: room.unreadCount ? { ...room.unreadCount } : undefined,
  lastMessage: room.lastMessage ? { ...room.lastMessage } : undefined,
});

const cloneMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
  readBy: message.readBy ? [...message.readBy] : undefined,
  createdAt: message.createdAt instanceof Date
    ? new Date(message.createdAt)
    : message.createdAt,
  clientCreatedAt: message.clientCreatedAt instanceof Date
    ? new Date(message.clientCreatedAt)
    : message.clientCreatedAt,
});

const seedRooms = () => {
  if (rooms.size > 0) {
    return;
  }

  Object.values(COMMUNITY_CHAT_DETAIL_SOURCE_MOCK).forEach(detail => {
    const department =
      detail.roomType === 'department'
        ? detail.title
        : undefined;

    const members = Array.from(
      new Set(detail.messages.map(message => message.senderId).filter(Boolean)),
    );

    const lastMessage = detail.messages[detail.messages.length - 1];

    rooms.set(detail.id, {
      id: detail.id,
      name: detail.title,
      type: detail.roomType,
      department,
      createdBy: members[0] ?? 'mock-admin',
      members,
      isPublic: detail.roomType !== 'custom',
      createdAt: new Date(detail.messages[0]?.createdAt ?? Date.now()),
      updatedAt: new Date(lastMessage?.createdAt ?? Date.now()),
      lastMessage: lastMessage
        ? {
            text: lastMessage.text,
            senderId: lastMessage.senderId,
            senderName: lastMessage.senderName,
            timestamp: new Date(lastMessage.createdAt),
          }
        : undefined,
      unreadCount: members.reduce<Record<string, number>>((accumulator, memberId) => {
        accumulator[memberId] = memberId === 'current-user' ? 0 : 1;
        return accumulator;
      }, {}),
    });

    messagesByRoom.set(
      detail.id,
      detail.messages.map(message => ({
        id: message.id,
        text: message.text,
        senderId: message.senderId,
        senderName: message.senderName,
        type: message.type ?? 'text',
        createdAt: new Date(message.createdAt),
        clientCreatedAt: new Date(message.createdAt),
      })),
    );
  });
};

seedRooms();

const emitRoomLists = () => {
  roomSubscribers.forEach(subscription => {
    subscription.callbacks.onData(
      Array.from(rooms.values())
        .filter(room => room.members.includes(subscription.userId))
        .map(cloneRoom),
    );
  });

  categorySubscribers.forEach(subscription => {
    subscription.callbacks.onData(resolveRoomsByFilter(subscription.filter));
  });
};

const emitRoomDetail = (chatRoomId: string) => {
  const room = rooms.get(chatRoomId) ?? null;
  roomDetailSubscribers.get(chatRoomId)?.forEach(callbacks => {
    callbacks.onData(room ? cloneRoom(room) : null);
  });
};

const emitStates = (userId: string) => {
  const nextStates = { ...(chatStates.get(userId) ?? {}) };
  stateSubscribers.get(userId)?.forEach(callbacks => {
    callbacks.onData(nextStates);
  });
};

const emitNotifications = (userId: string) => {
  const nextSettings = Array.from(rooms.keys()).reduce<Record<string, boolean>>(
    (accumulator, roomId) => {
      const key = keyForRoomSetting(roomId, userId);
      accumulator[roomId] = notificationSettings.get(key) ?? true;
      return accumulator;
    },
    {},
  );

  notificationSubscribers.get(userId)?.forEach(callbacks => {
    callbacks.onData(nextSettings);
  });
};

const resolveRoomsByFilter = (filter: ChatRoomFilter): ChatRoom[] => {
  return Array.from(rooms.values())
    .filter(room => {
      if (filter.category === 'all') {
        return true;
      }

      if (filter.category === 'custom') {
        return room.type === 'custom' && (!filter.userId || room.members.includes(filter.userId));
      }

      if (filter.category === 'department') {
        return room.type === 'department' && (!filter.department || room.department === filter.department);
      }

      return room.type === filter.category;
    })
    .map(cloneRoom);
};

const sortMessagesNewestFirst = (messages: ChatMessage[]) =>
  [...messages].sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt));

const nextMessageId = (chatRoomId: string) =>
  `${chatRoomId}-message-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export class MockChatRepository implements IChatRepository {
  subscribeToChatRooms(
    userId: string,
    callbacks: SubscriptionCallbacks<ChatRoom[]>,
  ): Unsubscribe {
    const subscription = { userId, callbacks };
    roomSubscribers.add(subscription);
    callbacks.onData(
      Array.from(rooms.values())
        .filter(room => room.members.includes(userId))
        .map(cloneRoom),
    );

    return () => {
      roomSubscribers.delete(subscription);
    };
  }

  subscribeToChatRoomsByCategory(
    filter: ChatRoomFilter,
    callbacks: SubscriptionCallbacks<ChatRoom[]>,
  ): Unsubscribe {
    const subscription = { filter, callbacks };
    categorySubscribers.add(subscription);
    callbacks.onData(resolveRoomsByFilter(filter));

    return () => {
      categorySubscribers.delete(subscription);
    };
  }

  subscribeToChatRoom(
    chatRoomId: string,
    callbacks: SubscriptionCallbacks<ChatRoom | null>,
  ): Unsubscribe {
    const bucket = roomDetailSubscribers.get(chatRoomId) ?? new Set();
    bucket.add(callbacks);
    roomDetailSubscribers.set(chatRoomId, bucket);
    callbacks.onData(rooms.get(chatRoomId) ? cloneRoom(rooms.get(chatRoomId)!) : null);

    return () => {
      roomDetailSubscribers.get(chatRoomId)?.delete(callbacks);
    };
  }

  async getChatRoom(chatRoomId: string): Promise<ChatRoom | null> {
    const room = rooms.get(chatRoomId);
    return room ? cloneRoom(room) : null;
  }

  async createChatRoom(chatRoom: Omit<ChatRoom, 'id'>): Promise<string> {
    const id = `mock-chat-room-${Date.now()}`;
    rooms.set(id, {
      ...chatRoom,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    messagesByRoom.set(id, []);
    emitRoomLists();
    emitRoomDetail(id);
    return id;
  }

  async joinChatRoom(chatRoomId: string, userId: string): Promise<void> {
    const room = rooms.get(chatRoomId);
    if (!room || room.members.includes(userId)) {
      return;
    }

    rooms.set(chatRoomId, {
      ...room,
      members: [...room.members, userId],
      unreadCount: {
        ...(room.unreadCount ?? {}),
        [userId]: 0,
      },
      updatedAt: new Date(),
    });
    emitRoomLists();
    emitRoomDetail(chatRoomId);
    emitNotifications(userId);
    emitStates(userId);
  }

  async leaveChatRoom(chatRoomId: string, userId: string): Promise<void> {
    const room = rooms.get(chatRoomId);
    if (!room) {
      return;
    }

    rooms.set(chatRoomId, {
      ...room,
      members: room.members.filter(memberId => memberId !== userId),
      updatedAt: new Date(),
    });
    emitRoomLists();
    emitRoomDetail(chatRoomId);
    emitNotifications(userId);
    emitStates(userId);
  }

  async getInitialMessages(
    chatRoomId: string,
    limit: number,
  ): Promise<PaginatedResult<ChatMessage>> {
    const sortedMessages = sortMessagesNewestFirst(messagesByRoom.get(chatRoomId) ?? []);
    const page = sortedMessages.slice(0, limit).map(cloneMessage);

    return {
      data: page,
      hasMore: sortedMessages.length > page.length,
      cursor: page.length > 0 ? page[page.length - 1].id : null,
    };
  }

  async getOlderMessages(
    chatRoomId: string,
    cursor: unknown,
    limit: number,
  ): Promise<PaginatedResult<ChatMessage>> {
    const sortedMessages = sortMessagesNewestFirst(messagesByRoom.get(chatRoomId) ?? []);
    const cursorId = typeof cursor === 'string' ? cursor : null;
    const startIndex = cursorId
      ? sortedMessages.findIndex(message => message.id === cursorId) + 1
      : 0;
    const page = sortedMessages.slice(startIndex, startIndex + limit).map(cloneMessage);

    return {
      data: page,
      hasMore: sortedMessages.length > startIndex + page.length,
      cursor: page.length > 0 ? page[page.length - 1].id : null,
    };
  }

  subscribeToNewMessages(
    chatRoomId: string,
    afterTimestamp: unknown,
    callbacks: MessageSubscriptionCallbacks,
  ): Unsubscribe {
    const bucket = newMessageSubscribers.get(chatRoomId) ?? new Set();
    const subscription = {
      afterTimestamp: toTimestamp(afterTimestamp),
      callbacks,
    };
    bucket.add(subscription);
    newMessageSubscribers.set(chatRoomId, bucket);

    return () => {
      newMessageSubscribers.get(chatRoomId)?.delete(subscription);
    };
  }

  async sendMessage(
    chatRoomId: string,
    message: Omit<ChatMessage, 'id' | 'createdAt'>,
  ): Promise<void> {
    const now = new Date();
    const nextMessage: ChatMessage = {
      ...message,
      id: nextMessageId(chatRoomId),
      createdAt: now,
      clientCreatedAt: message.clientCreatedAt ?? now,
    };
    const currentMessages = messagesByRoom.get(chatRoomId) ?? [];
    messagesByRoom.set(chatRoomId, [...currentMessages, nextMessage]);

    const room = rooms.get(chatRoomId);
    if (room) {
      const unreadCount = { ...(room.unreadCount ?? {}) };
      room.members.forEach(memberId => {
        if (memberId !== message.senderId) {
          unreadCount[memberId] = (unreadCount[memberId] ?? 0) + 1;
        }
      });

      rooms.set(chatRoomId, {
        ...room,
        unreadCount,
        updatedAt: now,
        lastMessage: {
          text: nextMessage.text,
          senderId: nextMessage.senderId,
          senderName: nextMessage.senderName,
          timestamp: now,
        },
      });
      emitRoomLists();
      emitRoomDetail(chatRoomId);
    }

    newMessageSubscribers.get(chatRoomId)?.forEach(subscription => {
      if (now.getTime() > subscription.afterTimestamp) {
        subscription.callbacks.onNewMessages([cloneMessage(nextMessage)]);
      }
    });
  }

  async getNotificationSetting(chatRoomId: string, userId: string): Promise<boolean> {
    return notificationSettings.get(keyForRoomSetting(chatRoomId, userId)) ?? true;
  }

  async updateNotificationSetting(
    chatRoomId: string,
    userId: string,
    enabled: boolean,
  ): Promise<void> {
    notificationSettings.set(keyForRoomSetting(chatRoomId, userId), enabled);
    emitNotifications(userId);
  }

  subscribeToChatRoomStates(
    userId: string,
    callbacks: SubscriptionCallbacks<ChatRoomStatesMap>,
  ): Unsubscribe {
    const bucket = stateSubscribers.get(userId) ?? new Set();
    bucket.add(callbacks);
    stateSubscribers.set(userId, bucket);
    callbacks.onData({ ...(chatStates.get(userId) ?? {}) });

    return () => {
      stateSubscribers.get(userId)?.delete(callbacks);
    };
  }

  subscribeToChatRoomNotifications(
    userId: string,
    callbacks: SubscriptionCallbacks<Record<string, boolean>>,
  ): Unsubscribe {
    const bucket = notificationSubscribers.get(userId) ?? new Set();
    bucket.add(callbacks);
    notificationSubscribers.set(userId, bucket);
    emitNotifications(userId);

    return () => {
      notificationSubscribers.get(userId)?.delete(callbacks);
    };
  }

  async updateLastReadAt(userId: string, chatRoomId: string): Promise<void> {
    const nextStates = {
      ...(chatStates.get(userId) ?? {}),
      [chatRoomId]: {
        lastReadAt: new Date(),
      },
    };
    chatStates.set(userId, nextStates);

    const room = rooms.get(chatRoomId);
    if (room) {
      rooms.set(chatRoomId, {
        ...room,
        unreadCount: {
          ...(room.unreadCount ?? {}),
          [userId]: 0,
        },
      });
      emitRoomLists();
      emitRoomDetail(chatRoomId);
    }

    emitStates(userId);
  }
}
