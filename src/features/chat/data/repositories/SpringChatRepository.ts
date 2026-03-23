import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import {
  RepositoryError,
  RepositoryErrorCode,
} from '@/shared/lib/errors';
import {
  chatSocketClient,
  createNativeStompSocket,
  MinimalStompClient,
  type StompFrame,
  type StompSubscription,
} from '@/shared/realtime';

import type {
  ChatMessage,
  ChatMessageDraft,
  ChatRoom,
  ChatRoomFilter,
  ChatRoomStatesMap,
  MessageSubscriptionCallbacks,
  PaginatedResult,
} from '../../model/types';
import {chatApiClient} from '../api/chatApiClient';
import type {
  ChatMessageResponseDto,
  ChatMessageCursorResponseDto,
  ChatRoomSummaryEventResponseDto,
  StompApiErrorDto,
} from '../dto/chatDto';
import {
  mapChatMessageDraftToDto,
  mapChatMessageDto,
  mapChatRoomDetailDto,
  mapChatRoomSummaryDto,
  mergeChatRoomSummaryEvent,
} from '../mappers/chatMapper';
import type {IChatRepository} from './IChatRepository';

interface ListSubscription {
  callbacks: SubscriptionCallbacks<ChatRoom[]>;
  filter: ChatRoomFilter;
  id: number;
}

interface RoomMessageRealtimeState {
  callbacks: Set<MessageSubscriptionCallbacks>;
  subscription: StompSubscription | null;
}

const STOMP_CONNECT_TIMEOUT_MS = 10000;

const buildNativeStompWebSocketPath = (endpointPath = '/ws') => {
  const normalizedPath = endpointPath.replace(/\/$/, '');

  if (normalizedPath.endsWith('/websocket')) {
    return normalizedPath.replace(/\/websocket$/, '-native');
  }

  if (normalizedPath.endsWith('-native')) {
    return normalizedPath;
  }

  return `${normalizedPath}-native`;
};

const cloneRoom = (room: ChatRoom): ChatRoom => ({
  ...room,
  lastMessage: room.lastMessage
    ? {
        ...room.lastMessage,
      }
    : undefined,
  members: room.members ? [...room.members] : undefined,
});

const cloneMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
});

const toMillis = (value: unknown) => {
  if (!value) {
    return 0;
  }

  const millis = new Date(String(value)).getTime();
  return Number.isFinite(millis) ? millis : 0;
};

const sortChatRooms = (left: ChatRoom, right: ChatRoom) => {
  const rightMillis = toMillis(right.lastMessage?.createdAt ?? right.updatedAt);
  const leftMillis = toMillis(left.lastMessage?.createdAt ?? left.updatedAt);

  if (rightMillis !== leftMillis) {
    return rightMillis - leftMillis;
  }

  return left.name.localeCompare(right.name, 'ko-KR');
};

const createStompRepositoryError = (
  message: string,
  context?: Record<string, unknown>,
) =>
  new RepositoryError(
    RepositoryErrorCode.SUBSCRIPTION_FAILED,
    message,
    {
      context,
    },
  );

const isGeneralChatRoom = (room: ChatRoom) => room.type !== 'party';

const isJoinedRoom = (room: ChatRoom) => room.isJoined !== false;

const matchesFilter = (room: ChatRoom, filter: ChatRoomFilter) => {
  if (!isGeneralChatRoom(room) || !isJoinedRoom(room)) {
    return false;
  }

  if (filter.category === 'all') {
    return true;
  }

  return room.type === filter.category;
};

const hasRoomDetail = (room?: ChatRoom | null) =>
  Boolean(
    room &&
      (typeof room.isMuted === 'boolean' ||
        room.lastReadAt !== undefined ||
        room.description !== undefined),
  );

export class SpringChatRepository implements IChatRepository {
  private readonly listSubscriptions = new Map<number, ListSubscription>();

  private readonly messageRealtimeStates = new Map<
    string,
    RoomMessageRealtimeState
  >();

  private readonly notificationSubscribers = new Map<
    string,
    Set<SubscriptionCallbacks<Record<string, boolean>>>
  >();

  private readonly roomCache = new Map<string, ChatRoom>();

  private readonly roomDetailSubscribers = new Map<
    string,
    Set<SubscriptionCallbacks<ChatRoom | null>>
  >();

  private readonly roomLoadPromises = new Map<string, Promise<ChatRoom | null>>();

  private readonly stateSubscribers = new Map<
    string,
    Set<SubscriptionCallbacks<ChatRoomStatesMap>>
  >();

  private errorSubscription: StompSubscription | null = null;

  private listSubscriptionSequence = 0;

  private stompClient: MinimalStompClient | null = null;

  private stompClientGeneration = 0;

  private stompConnectionPromise: Promise<MinimalStompClient> | null = null;

  private summarySubscription: StompSubscription | null = null;

  subscribeToChatRooms(
    userId: string,
    callbacks: SubscriptionCallbacks<ChatRoom[]>,
  ): Unsubscribe {
    return this.subscribeToChatRoomsByCategory(
      {
        category: 'all',
        userId,
      },
      callbacks,
    );
  }

  subscribeToChatRoomsByCategory(
    filter: ChatRoomFilter,
    callbacks: SubscriptionCallbacks<ChatRoom[]>,
  ): Unsubscribe {
    const subscriptionId = ++this.listSubscriptionSequence;
    const normalizedFilter: ChatRoomFilter = {
      category: filter.category,
      userId: filter.userId,
      department: filter.department,
    };

    this.listSubscriptions.set(subscriptionId, {
      callbacks,
      filter: normalizedFilter,
      id: subscriptionId,
    });

    this.fetchAndPublishListSubscription(subscriptionId).catch(error => {
      callbacks.onError(error as Error);
    });

    this.ensureStompClient()
      .then(() => {
        this.ensureErrorSubscription();
        this.ensureSummarySubscription();
      })
      .catch(error => {
        callbacks.onError(error as Error);
      });

    return () => {
      this.listSubscriptions.delete(subscriptionId);

      if (!this.hasRealtimeSubscribers()) {
        this.deactivateStompClient().catch(() => undefined);
      }
    };
  }

  subscribeToChatRoom(
    chatRoomId: string,
    callbacks: SubscriptionCallbacks<ChatRoom | null>,
  ): Unsubscribe {
    const bucket = this.roomDetailSubscribers.get(chatRoomId) ?? new Set();
    bucket.add(callbacks);
    this.roomDetailSubscribers.set(chatRoomId, bucket);

    this.loadChatRoom(chatRoomId, false)
      .then(room => {
        callbacks.onData(room ? cloneRoom(room) : null);
      })
      .catch(error => {
        callbacks.onError(error as Error);
      });

    return () => {
      const currentBucket = this.roomDetailSubscribers.get(chatRoomId);

      currentBucket?.delete(callbacks);

      if (currentBucket && currentBucket.size === 0) {
        this.roomDetailSubscribers.delete(chatRoomId);
      }
    };
  }

  async getChatRoom(chatRoomId: string): Promise<ChatRoom | null> {
    const room = await this.loadChatRoom(chatRoomId, false);

    return room ? cloneRoom(room) : null;
  }

  async createChatRoom(_chatRoom: Omit<ChatRoom, 'id'>): Promise<string> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '일반 채팅방 생성 API는 아직 서버 계약이 없습니다.',
    );
  }

  async joinChatRoom(_chatRoomId: string, _userId: string): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '일반 채팅방 참여 API는 아직 서버 계약이 없습니다.',
    );
  }

  async leaveChatRoom(_chatRoomId: string, _userId: string): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '일반 채팅방 나가기 API는 아직 서버 계약이 없습니다.',
    );
  }

  async getInitialMessages(
    chatRoomId: string,
    limit: number,
  ): Promise<PaginatedResult<ChatMessage>> {
    const response = await chatApiClient.getMessages(chatRoomId, {
      size: limit,
    });

    return {
      cursor: response.data.nextCursor ?? null,
      data: response.data.messages.map(mapChatMessageDto),
      hasMore: response.data.hasNext,
    };
  }

  async getOlderMessages(
    chatRoomId: string,
    cursor: unknown,
    limit: number,
  ): Promise<PaginatedResult<ChatMessage>> {
    const nextCursor = cursor as ChatMessageCursorResponseDto | null;

    if (!nextCursor?.createdAt || !nextCursor?.id) {
      return {
        cursor: null,
        data: [],
        hasMore: false,
      };
    }

    const response = await chatApiClient.getMessages(chatRoomId, {
      cursorCreatedAt: nextCursor.createdAt,
      cursorId: nextCursor.id,
      size: limit,
    });

    return {
      cursor: response.data.nextCursor ?? null,
      data: response.data.messages.map(mapChatMessageDto),
      hasMore: response.data.hasNext,
    };
  }

  subscribeToNewMessages(
    chatRoomId: string,
    _afterTimestamp: unknown,
    callbacks: MessageSubscriptionCallbacks,
  ): Unsubscribe {
    const realtimeState = this.messageRealtimeStates.get(chatRoomId) ?? {
      callbacks: new Set<MessageSubscriptionCallbacks>(),
      subscription: null,
    };

    realtimeState.callbacks.add(callbacks);
    this.messageRealtimeStates.set(chatRoomId, realtimeState);

    this.ensureStompClient()
      .then(() => {
        this.ensureErrorSubscription();
        this.ensureRoomMessageSubscription(chatRoomId);
      })
      .catch(error => {
        callbacks.onError(error as Error);
      });

    return () => {
      const currentState = this.messageRealtimeStates.get(chatRoomId);

      if (!currentState) {
        return;
      }

      currentState.callbacks.delete(callbacks);

      if (currentState.callbacks.size === 0) {
        currentState.subscription?.unsubscribe();
        this.messageRealtimeStates.delete(chatRoomId);
      }

      if (!this.hasRealtimeSubscribers()) {
        this.deactivateStompClient().catch(() => undefined);
      }
    };
  }

  async sendMessage(
    chatRoomId: string,
    message: ChatMessageDraft,
  ): Promise<void> {
    if (message.type === 'system') {
      throw new RepositoryError(
        RepositoryErrorCode.INVALID_ARGUMENT,
        '일반 채팅방에서는 SYSTEM 메시지를 전송할 수 없습니다.',
      );
    }

    const client = await this.ensureStompClient();

    client.publish({
      body: JSON.stringify(mapChatMessageDraftToDto(message)),
      destination: `/app/chat/${chatRoomId}`,
    });
  }

  async getNotificationSetting(
    chatRoomId: string,
    _userId: string,
  ): Promise<boolean> {
    const room = await this.getChatRoom(chatRoomId);
    return room?.isMuted !== true;
  }

  async updateNotificationSetting(
    chatRoomId: string,
    _userId: string,
    enabled: boolean,
  ): Promise<void> {
    const response = await chatApiClient.updateSettings(chatRoomId, {
      muted: !enabled,
    });
    const existing = this.roomCache.get(chatRoomId);

    if (existing) {
      this.roomCache.set(chatRoomId, {
        ...existing,
        isMuted: response.data.muted,
      });
      this.publishRoom(chatRoomId);
      this.publishNotifications();
    } else {
      await this.loadChatRoom(chatRoomId, true);
    }
  }

  subscribeToChatRoomStates(
    userId: string,
    callbacks: SubscriptionCallbacks<ChatRoomStatesMap>,
  ): Unsubscribe {
    const bucket = this.stateSubscribers.get(userId) ?? new Set();
    bucket.add(callbacks);
    this.stateSubscribers.set(userId, bucket);

    this.hydrateJoinedRoomDetails(userId)
      .then(() => {
        callbacks.onData(this.buildStatesMap());
      })
      .catch(error => {
        callbacks.onError(error as Error);
      });

    this.ensureStompClient()
      .then(() => {
        this.ensureErrorSubscription();
        this.ensureSummarySubscription();
      })
      .catch(error => {
        callbacks.onError(error as Error);
      });

    return () => {
      const currentBucket = this.stateSubscribers.get(userId);

      currentBucket?.delete(callbacks);

      if (currentBucket && currentBucket.size === 0) {
        this.stateSubscribers.delete(userId);
      }

      if (!this.hasRealtimeSubscribers()) {
        this.deactivateStompClient().catch(() => undefined);
      }
    };
  }

  subscribeToChatRoomNotifications(
    userId: string,
    callbacks: SubscriptionCallbacks<Record<string, boolean>>,
  ): Unsubscribe {
    const bucket = this.notificationSubscribers.get(userId) ?? new Set();
    bucket.add(callbacks);
    this.notificationSubscribers.set(userId, bucket);

    this.hydrateJoinedRoomDetails(userId)
      .then(() => {
        callbacks.onData(this.buildNotificationMap());
      })
      .catch(error => {
        callbacks.onError(error as Error);
      });

    this.ensureStompClient()
      .then(() => {
        this.ensureErrorSubscription();
        this.ensureSummarySubscription();
      })
      .catch(error => {
        callbacks.onError(error as Error);
      });

    return () => {
      const currentBucket = this.notificationSubscribers.get(userId);

      currentBucket?.delete(callbacks);

      if (currentBucket && currentBucket.size === 0) {
        this.notificationSubscribers.delete(userId);
      }

      if (!this.hasRealtimeSubscribers()) {
        this.deactivateStompClient().catch(() => undefined);
      }
    };
  }

  async updateLastReadAt(_userId: string, chatRoomId: string): Promise<void> {
    const response = await chatApiClient.markAsRead(chatRoomId, {
      lastReadAt: new Date().toISOString(),
    });
    const existing = this.roomCache.get(chatRoomId);

    if (existing) {
      this.roomCache.set(chatRoomId, {
        ...existing,
        lastReadAt: response.data.lastReadAt,
        unreadCount: 0,
      });
      this.publishRoom(chatRoomId);
      this.publishLists();
      this.publishStates();
    } else {
      await this.loadChatRoom(chatRoomId, true);
    }
  }

  private buildListFilter(filter: ChatRoomFilter) {
    switch (filter.category) {
      case 'custom':
        return {
          joined: true,
          type: 'CUSTOM',
        };
      case 'department':
        return {
          joined: true,
          type: 'DEPARTMENT',
        };
      case 'game':
        return {
          joined: true,
          type: 'GAME',
        };
      case 'university':
        return {
          joined: true,
          type: 'UNIVERSITY',
        };
      case 'all':
      default:
        return {
          joined: true,
        };
    }
  }

  private buildNotificationMap() {
    return this.getCachedGeneralChatRooms().reduce<Record<string, boolean>>(
      (accumulator, room) => {
        if (room.id) {
          accumulator[room.id] = room.isMuted !== true;
        }

        return accumulator;
      },
      {},
    );
  }

  private buildStatesMap(): ChatRoomStatesMap {
    return this.getCachedGeneralChatRooms().reduce<ChatRoomStatesMap>(
      (accumulator, room) => {
        if (room.id) {
          accumulator[room.id] = {
            lastReadAt: room.lastReadAt,
          };
        }

        return accumulator;
      },
      {},
    );
  }

  private clearStompSubscriptions() {
    this.summarySubscription?.unsubscribe();
    this.summarySubscription = null;

    this.errorSubscription?.unsubscribe();
    this.errorSubscription = null;

    this.messageRealtimeStates.forEach(state => {
      state.subscription?.unsubscribe();
      state.subscription = null;
    });
  }

  private async deactivateStompClient() {
    this.clearStompSubscriptions();

    if (!this.stompClient) {
      return;
    }

    const client = this.stompClient;

    this.stompClient = null;
    this.stompConnectionPromise = null;
    this.stompClientGeneration += 1;

    try {
      await client.deactivate({force: true});
    } catch {
      // Ignore cleanup failure.
    }
  }

  private ensureErrorSubscription() {
    if (!this.stompClient?.connected || this.errorSubscription) {
      return;
    }

    this.errorSubscription = this.stompClient.subscribe(
      '/user/queue/errors',
      frame => {
        const payload = this.parseFrameBody<StompApiErrorDto>(frame);
        const error = createStompRepositoryError(
          payload?.message ?? '채팅 실시간 처리 중 오류가 발생했습니다.',
          {
            apiErrorCode: payload?.errorCode,
          },
        );

        this.notifyRealtimeSubscribers(error);
      },
    );
  }

  private async ensureRoomMessageSubscription(chatRoomId: string) {
    const realtimeState = this.messageRealtimeStates.get(chatRoomId);

    if (
      !realtimeState ||
      realtimeState.callbacks.size === 0 ||
      realtimeState.subscription ||
      !this.stompClient?.connected
    ) {
      return;
    }

    realtimeState.subscription = this.stompClient.subscribe(
      `/topic/chat/${chatRoomId}`,
      frame => {
        this.handleIncomingRoomMessage(chatRoomId, frame).catch(() => undefined);
      },
    );
  }

  private ensureSummarySubscription() {
    if (
      !this.stompClient?.connected ||
      this.summarySubscription ||
      !this.hasSummarySubscribers()
    ) {
      return;
    }

    this.summarySubscription = this.stompClient.subscribe(
      '/user/queue/chat-rooms',
      frame => {
        this.handleSummaryEvent(frame).catch(() => undefined);
      },
    );
  }

  private async ensureStompClient(): Promise<MinimalStompClient> {
    if (this.stompClient?.connected) {
      return this.stompClient;
    }

    if (this.stompConnectionPromise) {
      return this.stompConnectionPromise;
    }

    if (!this.stompClient) {
      this.stompClient = new MinimalStompClient();
    }

    const client = this.stompClient;
    const generation = ++this.stompClientGeneration;

    this.stompConnectionPromise = new Promise<MinimalStompClient>((resolve, reject) => {
      let settled = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        safeReject(
          createStompRepositoryError('채팅 실시간 연결 시간이 초과되었습니다.', {
            timeoutMs: STOMP_CONNECT_TIMEOUT_MS,
          }),
        );
        this.deactivateStompClient().catch(() => undefined);
      }, STOMP_CONNECT_TIMEOUT_MS);

      const clearTimeoutId = () => {
        if (!timeoutId) {
          return;
        }

        clearTimeout(timeoutId);
        timeoutId = null;
      };

      const safeReject = (error: RepositoryError) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeoutId();
        reject(error);
      };

      client.beforeConnect = async () => {
        try {
          const options = await chatSocketClient.buildConnectionOptions({
            endpointPath: buildNativeStompWebSocketPath(),
          });

          client.connectHeaders = options.connectHeaders;
          client.webSocketFactory = () => createNativeStompSocket(options.url);
          client.heartbeatIncoming = options.heartbeatIncomingMs;
          client.heartbeatOutgoing = options.heartbeatOutgoingMs;
          client.reconnectDelay = options.reconnectDelayMs;
        } catch (error) {
          const repositoryError = createStompRepositoryError(
            '채팅 실시간 연결 준비에 실패했습니다.',
            {
              cause: error,
            },
          );

          safeReject(repositoryError);
          throw repositoryError;
        }
      };

      client.onConnect = () => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        this.ensureErrorSubscription();
        this.ensureSummarySubscription();
        this.messageRealtimeStates.forEach((_, chatRoomId) => {
          this.ensureRoomMessageSubscription(chatRoomId).catch(() => undefined);
        });

        if (!settled) {
          settled = true;
          clearTimeoutId();
          resolve(client);
        }
      };

      client.onDisconnect = () => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        this.clearStompSubscriptions();
      };

      client.onStompError = frame => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        const error = createStompRepositoryError(
          frame.headers.message ||
            this.parseFrameBody<StompApiErrorDto>(frame)?.message ||
            '채팅 실시간 연결에 실패했습니다.',
          {
            frameBody: frame.body,
          },
        );
        this.notifyRealtimeSubscribers(error);
        safeReject(error);
      };

      client.onWebSocketClose = event => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        this.clearStompSubscriptions();

        if (!settled) {
          safeReject(
            createStompRepositoryError('채팅 실시간 연결이 닫혔습니다.', {
              closeCode: event.code,
              closeReason: event.reason,
              wasClean: event.wasClean,
            }),
          );
        }
      };

      client.onWebSocketError = event => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        safeReject(
          createStompRepositoryError('채팅 실시간 연결을 열지 못했습니다.', {
            event,
          }),
        );
      };

      client.activate();
    }).finally(() => {
      if (this.isCurrentStompClient(client, generation)) {
        this.stompConnectionPromise = null;
      }
    });

    return this.stompConnectionPromise;
  }

  private async fetchAndPublishListSubscription(subscriptionId: number) {
    const subscription = this.listSubscriptions.get(subscriptionId);

    if (!subscription) {
      return;
    }

    const response = await chatApiClient.getChatRooms(
      this.buildListFilter(subscription.filter),
    );
    const rooms = response.data
      .map(mapChatRoomSummaryDto)
      .filter(isGeneralChatRoom);

    rooms.forEach(room => {
      if (!room.id) {
        return;
      }

      const existing = this.roomCache.get(room.id);

      this.roomCache.set(
        room.id,
        existing
          ? {
              ...existing,
              ...room,
              lastMessage: room.lastMessage ?? existing.lastMessage,
              updatedAt: room.updatedAt ?? existing.updatedAt,
            }
          : room,
      );
    });

    subscription.callbacks.onData(this.resolveRoomsForFilter(subscription.filter));
  }

  private async handleIncomingRoomMessage(chatRoomId: string, frame: StompFrame) {
    const payload = this.parseFrameBody<ChatMessageResponseDto>(frame);

    if (!payload) {
      return;
    }

    const message = mapChatMessageDto(payload);
    const room = this.roomCache.get(chatRoomId);

    if (room) {
      this.roomCache.set(chatRoomId, {
        ...room,
        lastMessage: {
          createdAt: message.createdAt,
          senderName: message.senderName,
          text: message.text,
          type: message.type,
        },
        updatedAt: message.createdAt,
      });
      this.publishRoom(chatRoomId);
      this.publishLists();
    }

    this.messageRealtimeStates.get(chatRoomId)?.callbacks.forEach(callbacks => {
      callbacks.onNewMessages([cloneMessage(message)]);
    });
  }

  private async handleSummaryEvent(frame: StompFrame) {
    const payload = this.parseFrameBody<ChatRoomSummaryEventResponseDto>(frame);

    if (!payload?.chatRoomId) {
      return;
    }

    if (payload.eventType === 'CHAT_ROOM_REMOVED') {
      this.roomCache.delete(payload.chatRoomId);
      this.publishRoom(payload.chatRoomId, null);
      this.publishLists();
      this.publishNotifications();
      this.publishStates();
      return;
    }

    const existing = this.roomCache.get(payload.chatRoomId);

    if (!existing) {
      await this.loadChatRoom(payload.chatRoomId, true);
      this.publishLists();
      return;
    }

    this.roomCache.set(
      payload.chatRoomId,
      mergeChatRoomSummaryEvent(existing, payload),
    );
    this.publishRoom(payload.chatRoomId);
    this.publishLists();
  }

  private hasRealtimeSubscribers() {
    return this.hasSummarySubscribers() || this.messageRealtimeStates.size > 0;
  }

  private hasSummarySubscribers() {
    return (
      this.listSubscriptions.size > 0 ||
      this.stateSubscribers.size > 0 ||
      this.notificationSubscribers.size > 0
    );
  }

  private async hydrateJoinedRoomDetails(userId: string) {
    const response = await chatApiClient.getChatRooms({
      joined: true,
    });
    const rooms = response.data
      .map(mapChatRoomSummaryDto)
      .filter(isGeneralChatRoom);

    rooms.forEach(room => {
      if (room.id) {
        this.roomCache.set(room.id, room);
      }
    });

    await Promise.all(
      rooms
        .filter(room => room.id)
        .map(room =>
          this.loadChatRoom(room.id!, true).catch(() => null),
        ),
    );

    if (!this.stateSubscribers.has(userId) && !this.notificationSubscribers.has(userId)) {
      return;
    }

    this.publishStates();
    this.publishNotifications();
  }

  private isCurrentStompClient(client: MinimalStompClient, generation: number) {
    return this.stompClient === client && this.stompClientGeneration === generation;
  }

  private async loadChatRoom(
    chatRoomId: string,
    forceRefresh: boolean,
  ): Promise<ChatRoom | null> {
    const cached = this.roomCache.get(chatRoomId);

    if (!forceRefresh && hasRoomDetail(cached)) {
      return cached ? cloneRoom(cached) : null;
    }

    const pending = this.roomLoadPromises.get(chatRoomId);

    if (pending) {
      return pending;
    }

    const loadPromise = chatApiClient.getChatRoom(chatRoomId)
      .then(response => {
        const mapped = mapChatRoomDetailDto(response.data, this.roomCache.get(chatRoomId));

        this.roomCache.set(chatRoomId, mapped);
        this.publishRoom(chatRoomId);
        this.publishNotifications();
        this.publishStates();

        return cloneRoom(mapped);
      })
      .catch(error => {
        if (
          error instanceof RepositoryError &&
          error.code === RepositoryErrorCode.NOT_FOUND
        ) {
          return null;
        }

        throw error;
      })
      .finally(() => {
        this.roomLoadPromises.delete(chatRoomId);
      });

    this.roomLoadPromises.set(chatRoomId, loadPromise);

    return loadPromise;
  }

  private notifyRealtimeSubscribers(error: RepositoryError) {
    this.listSubscriptions.forEach(subscription => {
      subscription.callbacks.onError(error);
    });

    this.messageRealtimeStates.forEach(state => {
      state.callbacks.forEach(callbacks => {
        callbacks.onError(error);
      });
    });

    this.notificationSubscribers.forEach(bucket => {
      bucket.forEach(callbacks => {
        callbacks.onError(error);
      });
    });

    this.stateSubscribers.forEach(bucket => {
      bucket.forEach(callbacks => {
        callbacks.onError(error);
      });
    });
  }

  private parseFrameBody<T>(frame: {body: string}): T | null {
    if (!frame.body) {
      return null;
    }

    try {
      return JSON.parse(frame.body) as T;
    } catch {
      return null;
    }
  }

  private publishLists() {
    this.listSubscriptions.forEach(subscription => {
      subscription.callbacks.onData(this.resolveRoomsForFilter(subscription.filter));
    });
  }

  private publishNotifications() {
    const nextMap = this.buildNotificationMap();

    this.notificationSubscribers.forEach(bucket => {
      bucket.forEach(callbacks => {
        callbacks.onData(nextMap);
      });
    });
  }

  private publishRoom(chatRoomId: string, room?: ChatRoom | null) {
    const resolvedRoom =
      room === undefined
        ? this.roomCache.get(chatRoomId) ?? null
        : room;

    this.roomDetailSubscribers.get(chatRoomId)?.forEach(callbacks => {
      callbacks.onData(resolvedRoom ? cloneRoom(resolvedRoom) : null);
    });
  }

  private publishStates() {
    const nextState = this.buildStatesMap();

    this.stateSubscribers.forEach(bucket => {
      bucket.forEach(callbacks => {
        callbacks.onData(nextState);
      });
    });
  }

  private resolveRoomsForFilter(filter: ChatRoomFilter) {
    return this.getCachedGeneralChatRooms()
      .filter(room => matchesFilter(room, filter))
      .sort(sortChatRooms)
      .map(cloneRoom);
  }

  private getCachedGeneralChatRooms() {
    return Array.from(this.roomCache.values()).filter(isGeneralChatRoom);
  }
}
