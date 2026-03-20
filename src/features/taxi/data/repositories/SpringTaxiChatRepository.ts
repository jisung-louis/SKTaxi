import {Client, type IMessage, type StompSubscription} from '@stomp/stompjs';

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
} from '@/shared/realtime';

import type {TaxiRecruitDraft} from '../../model/taxiRecruitData';
import type {
  TaxiChatSessionSnapshot,
  TaxiChatSourceData,
} from '../../model/taxiChatViewData';
import {taxiHomeApiClient} from '../api/taxiHomeApiClient';
import {taxiChatApiClient} from '../api/taxiChatApiClient';
import type {
  ChatMessageResponseDto,
  SendChatMessageRequestDto,
  StompApiErrorDto,
} from '../dto/taxiChatDto';
import {
  buildTaxiChatSourceData,
  mapTaxiChatMessageDto,
  resolveTaxiChatRoomId,
} from '../mappers/taxiChatMapper';
import type {ITaxiChatRepository} from './ITaxiChatRepository';

interface PartyChatState {
  loadPromise: Promise<TaxiChatSourceData | null> | null;
  roomSubscription: StompSubscription | null;
  source: TaxiChatSourceData | null;
  subscribers: Set<SubscriptionCallbacks<TaxiChatSourceData | null>>;
}

const MESSAGES_PAGE_SIZE = 100;

const buildSockJsWebSocketPath = (endpointPath = '/ws') =>
  endpointPath.endsWith('/websocket')
    ? endpointPath
    : `${endpointPath.replace(/\/$/, '')}/websocket`;

const clonePartySource = (
  source: TaxiChatSourceData,
): TaxiChatSourceData => ({
  ...source,
  messages: source.messages.map(message => ({
    ...message,
    avatar: message.avatar ? {...message.avatar} : undefined,
  })),
  participants: source.participants.map(participant => ({...participant})),
  settlement: source.settlement ? {...source.settlement} : undefined,
  summary: {...source.summary},
});

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

export class SpringTaxiChatRepository implements ITaxiChatRepository {
  private readonly partyStates = new Map<string, PartyChatState>();

  private readonly sessionListeners = new Set<() => void>();

  private currentPartyId: string | null = null;

  private errorSubscription: StompSubscription | null = null;

  private stompClient: Client | null = null;

  private stompConnectionPromise: Promise<Client> | null = null;

  private stompClientGeneration = 0;

  async createPartyChat(_draft: TaxiRecruitDraft): Promise<{partyId: string}> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '파티 생성은 현재 채팅 저장소에서 지원하지 않습니다.',
    );
  }

  async getPartyChat(partyId: string): Promise<TaxiChatSourceData | null> {
    const source = await this.loadPartyChat(partyId, true);

    return source ? clonePartySource(source) : null;
  }

  getSessionSnapshot(): TaxiChatSessionSnapshot {
    return {
      currentPartyId: this.currentPartyId,
    };
  }

  async resetSession(): Promise<void> {
    this.clearPartyStates();

    if (this.currentPartyId !== null) {
      this.currentPartyId = null;
      this.emitSessionChange();
    }

    await this.deactivateStompClient();
  }

  async sendMessage(
    partyId: string,
    messageText: string,
  ): Promise<TaxiChatSourceData | null> {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      const state = this.partyStates.get(partyId);

      return state?.source ? clonePartySource(state.source) : null;
    }

    const client = await this.ensureStompClient();

    client.publish({
      body: JSON.stringify({
        text: trimmedMessage,
        type: 'TEXT',
      } satisfies SendChatMessageRequestDto),
      destination: `/app/chat/${resolveTaxiChatRoomId(partyId)}`,
    });

    const state = this.partyStates.get(partyId);

    return state?.source ? clonePartySource(state.source) : null;
  }

  async setCurrentParty(partyId: string): Promise<void> {
    this.currentPartyId = partyId;
    this.emitSessionChange();
  }

  subscribeToPartyChat(
    partyId: string,
    callbacks: SubscriptionCallbacks<TaxiChatSourceData | null>,
  ): Unsubscribe {
    const state = this.getOrCreatePartyState(partyId);
    state.subscribers.add(callbacks);

    if (state.source) {
      callbacks.onData(clonePartySource(state.source));
    }

    this.loadPartyChat(partyId, true).catch(error => {
        callbacks.onError(error as Error);
      });

    this.ensureStompClient()
      .then(() => {
        this.ensureRoomSubscription(partyId);
      })
      .catch(error => {
        callbacks.onError(error as Error);
      });

    return () => {
      const currentState = this.partyStates.get(partyId);

      if (!currentState) {
        return;
      }

      currentState.subscribers.delete(callbacks);

      if (currentState.subscribers.size === 0) {
        currentState.roomSubscription?.unsubscribe();
        currentState.roomSubscription = null;

        if (this.currentPartyId === partyId) {
          this.currentPartyId = null;
          this.emitSessionChange();
        }

        this.partyStates.delete(partyId);

        if (!this.hasActiveSubscribers()) {
          this.deactivateStompClient().catch(error => {
            console.warn('채팅 STOMP 클라이언트를 정리하지 못했습니다.', error);
          });
        }
      }
    };
  }

  subscribeToSession(listener: () => void) {
    this.sessionListeners.add(listener);

    return () => {
      this.sessionListeners.delete(listener);
    };
  }

  async updateNotificationSetting(
    partyId: string,
    enabled: boolean,
  ): Promise<TaxiChatSourceData | null> {
    const chatRoomId = resolveTaxiChatRoomId(partyId);
    const response = await taxiChatApiClient.updateSettings(chatRoomId, !enabled);
    const state = this.getOrCreatePartyState(partyId);

    if (state.source) {
      state.source = {
        ...state.source,
        notificationEnabled: !response.data.muted,
      };
      this.publishPartyState(partyId);
      return clonePartySource(state.source);
    }

    const source = await this.loadPartyChat(partyId, true);

    return source ? clonePartySource(source) : null;
  }

  private clearStompSubscriptions() {
    this.errorSubscription?.unsubscribe();
    this.errorSubscription = null;

    this.partyStates.forEach(state => {
      state.roomSubscription?.unsubscribe();
      state.roomSubscription = null;
    });
  }

  private clearPartyStates() {
    this.partyStates.forEach(state => {
      state.roomSubscription?.unsubscribe();
      state.roomSubscription = null;
      state.source = null;
      state.subscribers.clear();
    });
    this.errorSubscription?.unsubscribe();
    this.errorSubscription = null;
    this.partyStates.clear();
  }

  private async deactivateStompClient() {
    const client = this.stompClient;

    this.stompClientGeneration += 1;
    this.stompClient = null;
    this.stompConnectionPromise = null;
    this.errorSubscription = null;

    if (!client) {
      return;
    }

    try {
      await client.deactivate({force: true});
    } catch (error) {
      console.warn('채팅 STOMP 연결 종료에 실패했습니다.', error);
    }
  }

  private emitSessionChange() {
    this.sessionListeners.forEach(listener => {
      listener();
    });
  }

  private ensureErrorSubscription() {
    if (!this.stompClient?.connected || this.errorSubscription) {
      return;
    }

    this.errorSubscription = this.stompClient.subscribe(
      '/user/queue/errors',
      frame => {
        const payload = this.parseFrameBody<StompApiErrorDto>(frame);
        const message =
          payload?.message || '채팅 실시간 처리 중 오류가 발생했습니다.';
        const error = createStompRepositoryError(message, {
          apiErrorCode: payload?.errorCode,
        });

        this.notifyPartySubscribers(error);
      },
    );
  }

  private ensureRoomSubscription(partyId: string) {
    const state = this.partyStates.get(partyId);

    if (
      !state ||
      state.subscribers.size === 0 ||
      state.roomSubscription ||
      !this.stompClient?.connected
    ) {
      return;
    }

    state.roomSubscription = this.stompClient.subscribe(
      `/topic/chat/${resolveTaxiChatRoomId(partyId)}`,
      frame => {
        this.handleIncomingMessage(partyId, frame).catch(() => undefined);
      },
    );
  }

  private async ensureStompClient(): Promise<Client> {
    if (this.stompClient?.connected) {
      return this.stompClient;
    }

    if (this.stompConnectionPromise) {
      return this.stompConnectionPromise;
    }

    if (!this.stompClient) {
      this.stompClient = new Client();
    }

    const client = this.stompClient;
    const generation = ++this.stompClientGeneration;

    this.stompConnectionPromise = new Promise<Client>((resolve, reject) => {
      let settled = false;

      const safeReject = (error: RepositoryError) => {
        if (settled) {
          return;
        }

        settled = true;
        reject(error);
      };

      client.beforeConnect = async () => {
        const options = await chatSocketClient.buildConnectionOptions({
          endpointPath: buildSockJsWebSocketPath(),
        });

        client.brokerURL = options.url;
        client.connectHeaders = options.connectHeaders;
        client.heartbeatIncoming = options.heartbeatIncomingMs;
        client.heartbeatOutgoing = options.heartbeatOutgoingMs;
        client.reconnectDelay = options.reconnectDelayMs;
      };

      client.onConnect = () => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        this.ensureErrorSubscription();
        this.partyStates.forEach((state, partyId) => {
          if (state.subscribers.size > 0) {
            this.ensureRoomSubscription(partyId);
          }
        });

        if (!settled) {
          settled = true;
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

        this.notifyPartySubscribers(error);
        safeReject(error);
      };

      client.onWebSocketClose = () => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        this.clearStompSubscriptions();
      };

      client.onWebSocketError = event => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        const error = createStompRepositoryError(
          '채팅 실시간 연결을 열지 못했습니다.',
          {
            event,
          },
        );

        safeReject(error);
      };

      client.activate();
    }).finally(() => {
      if (this.isCurrentStompClient(client, generation)) {
        this.stompConnectionPromise = null;
      }
    });

    return this.stompConnectionPromise;
  }

  private getOrCreatePartyState(partyId: string): PartyChatState {
    const existingState = this.partyStates.get(partyId);

    if (existingState) {
      return existingState;
    }

    const nextState: PartyChatState = {
      loadPromise: null,
      roomSubscription: null,
      source: null,
      subscribers: new Set(),
    };

    this.partyStates.set(partyId, nextState);
    return nextState;
  }

  private async handleIncomingMessage(partyId: string, frame: IMessage) {
    const message = this.parseFrameBody<ChatMessageResponseDto>(frame);

    if (!message) {
      await this.loadPartyChat(partyId, true);
      return;
    }

    const state = this.getOrCreatePartyState(partyId);

    if (!state.source) {
      await this.loadPartyChat(partyId, true);
      return;
    }

    if (state.source.messages.some(item => item.id === message.id)) {
      return;
    }

    state.source = {
      ...state.source,
      messages: [
        ...state.source.messages,
        mapTaxiChatMessageDto(message),
      ],
    };
    this.publishPartyState(partyId);
    await this.markLatestMessageAsRead(partyId, message.createdAt);
  }

  private async loadPartyChat(
    partyId: string,
    forceRefresh: boolean,
  ): Promise<TaxiChatSourceData | null> {
    const state = this.getOrCreatePartyState(partyId);

    if (!forceRefresh && state.source) {
      return state.source;
    }

    if (state.loadPromise) {
      return state.loadPromise;
    }

    const chatRoomId = resolveTaxiChatRoomId(partyId);

    state.loadPromise = Promise.all([
      taxiHomeApiClient.getParty(partyId),
      taxiChatApiClient.getChatRoom(chatRoomId),
      taxiChatApiClient.getMessages(chatRoomId, {
        size: MESSAGES_PAGE_SIZE,
      }),
    ])
      .then(([partyResponse, roomResponse, messagesResponse]) => {
        const source = buildTaxiChatSourceData({
          messages: messagesResponse.data.messages,
          party: partyResponse.data,
          room: roomResponse.data,
        });

        state.source = source;
        this.publishPartyState(partyId);

        const latestMessage =
          source.messages[source.messages.length - 1]?.createdAt;

        if (latestMessage && state.subscribers.size > 0) {
          this.markLatestMessageAsRead(partyId, latestMessage).catch(
            () => undefined,
          );
        }

        return source;
      })
      .catch(error => {
        throw error;
      })
      .finally(() => {
        state.loadPromise = null;
      });

    return state.loadPromise;
  }

  private hasActiveSubscribers() {
    return [...this.partyStates.values()].some(
      state => state.subscribers.size > 0,
    );
  }

  private isCurrentStompClient(client: Client, generation: number) {
    return this.stompClient === client && this.stompClientGeneration === generation;
  }

  private markLatestMessageAsRead(
    partyId: string,
    lastReadAt?: string,
  ) {
    if (!lastReadAt) {
      return Promise.resolve();
    }

    return taxiChatApiClient
      .markAsRead(resolveTaxiChatRoomId(partyId), lastReadAt)
      .catch(error => {
        console.warn('채팅 읽음 상태를 갱신하지 못했습니다.', error);
      });
  }

  private notifyPartySubscribers(error: RepositoryError) {
    this.partyStates.forEach(state => {
      if (state.subscribers.size === 0) {
        return;
      }

      state.subscribers.forEach(callbacks => {
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

  private publishPartyState(partyId: string) {
    const state = this.partyStates.get(partyId);

    if (!state || !state.source || state.subscribers.size === 0) {
      return;
    }

    state.subscribers.forEach(callbacks => {
      callbacks.onData(clonePartySource(state.source!));
    });
  }
}
