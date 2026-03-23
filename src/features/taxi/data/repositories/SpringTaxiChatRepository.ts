import {
  Client,
  Versions,
  type IMessage,
  type StompSubscription,
} from '@stomp/stompjs';

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
  TaxiChatAccountMessageDraft,
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

interface PendingSpecialMessageRequest {
  reject: (error: Error) => void;
  resolve: (value: TaxiChatSourceData | null) => void;
  snapshotFallbackTimeoutId: ReturnType<typeof setTimeout> | null;
  timeoutId: ReturnType<typeof setTimeout>;
}

const MESSAGES_PAGE_SIZE = 100;
const SPECIAL_MESSAGE_TIMEOUT_MS = 8000;
const STOMP_CONNECT_TIMEOUT_MS = 10000;
const STOMP_NATIVE_PROTOCOL = 'v12.stomp';

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

const clonePartySource = (
  source: TaxiChatSourceData,
): TaxiChatSourceData => ({
  ...source,
  departureLocation: {...source.departureLocation},
  destinationLocation: {...source.destinationLocation},
  latestAccountData: source.latestAccountData
    ? {...source.latestAccountData}
    : undefined,
  messages: source.messages.map(message => ({
    ...message,
    accountData: message.accountData ? {...message.accountData} : undefined,
    arrivalData: message.arrivalData
      ? {
          ...message.arrivalData,
          accountData: message.arrivalData.accountData
            ? {...message.arrivalData.accountData}
            : undefined,
          settlementTargetMemberIds: [...message.arrivalData.settlementTargetMemberIds],
        }
      : undefined,
    avatar: message.avatar ? {...message.avatar} : undefined,
  })),
  participants: source.participants.map(participant => ({...participant})),
  settlement: source.settlement
    ? {
        ...source.settlement,
        accountData: source.settlement.accountData
          ? {...source.settlement.accountData}
          : undefined,
        settlementTargetMemberIds: [...source.settlement.settlementTargetMemberIds],
      }
    : undefined,
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

const logAccountMessageLifecycle = (
  event: string,
  details?: Record<string, unknown>,
) => {
  if (!__DEV__) {
    return;
  }

  console.log('[taxi-chat][account-message]', {
    event,
    ...details,
  });
};

const logStompLifecycle = (
  event: string,
  details?: Record<string, unknown>,
) => {
  if (!__DEV__) {
    return;
  }

  console.log('[taxi-chat][stomp]', {
    event,
    ...details,
  });
};

const logTextMessageLifecycle = (
  event: string,
  details?: Record<string, unknown>,
) => {
  if (!__DEV__) {
    return;
  }

  console.log('[taxi-chat][text-message]', {
    event,
    ...details,
  });
};

export class SpringTaxiChatRepository implements ITaxiChatRepository {
  private readonly pendingSpecialMessageRequests = new Map<
    string,
    PendingSpecialMessageRequest
  >();

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

    logTextMessageLifecycle('send-start', {
      messageLength: trimmedMessage.length,
      partyId,
    });
    const client = await this.ensureStompClient();

    client.publish({
      body: JSON.stringify({
        text: trimmedMessage,
        type: 'TEXT',
      } satisfies SendChatMessageRequestDto),
      destination: `/app/chat/${resolveTaxiChatRoomId(partyId)}`,
    });
    logTextMessageLifecycle('publish', {
      messageLength: trimmedMessage.length,
      partyId,
    });

    const state = this.partyStates.get(partyId);

    return state?.source ? clonePartySource(state.source) : null;
  }

  async sendAccountMessage(
    partyId: string,
    payload: TaxiChatAccountMessageDraft,
  ): Promise<TaxiChatSourceData | null> {
    return this.publishSpecialMessage(partyId, {
      account: {
        accountHolder: payload.accountHolder,
        accountNumber: payload.accountNumber,
        bankName: payload.bankName,
        hideName: payload.hideName,
        remember: payload.remember,
      },
      type: 'ACCOUNT',
    });
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

  private buildSpecialMessageKey(
    partyId: string,
  ) {
    return `${partyId}:account`;
  }

  private getLatestAccountMessage(
    source: TaxiChatSourceData | null | undefined,
  ) {
    if (!source) {
      return undefined;
    }

    return [...source.messages]
      .reverse()
      .find(message => message.type === 'account' && message.accountData);
  }

  private matchesAccountPayload(
    message: ChatMessageResponseDto | TaxiChatSourceData['messages'][number],
    payload: SendChatMessageRequestDto,
  ) {
    if (payload.type !== 'ACCOUNT' || !payload.account || !message.accountData) {
      return false;
    }

    const {account} = payload;
    const {accountData} = message;

    if (
      accountData.bankName !== account.bankName ||
      accountData.accountNumber !== account.accountNumber ||
      Boolean(accountData.hideName) !== Boolean(account.hideName)
    ) {
      return false;
    }

    if (account.hideName) {
      return true;
    }

    return accountData.accountHolder === account.accountHolder;
  }

  private queueAccountSnapshotFallback(params: {
    key: string;
    partyId: string;
    payload: SendChatMessageRequestDto;
    previousLatestAccountMessageId?: string;
  }) {
    const timeoutId = setTimeout(() => {
      this.resolveAccountMessageFromSnapshot(params).catch(error => {
        logAccountMessageLifecycle('snapshot-fallback-error', {
          error,
          partyId: params.partyId,
        });
      });
    }, 1500);

    const pendingRequest = this.pendingSpecialMessageRequests.get(params.key);

    if (pendingRequest) {
      pendingRequest.snapshotFallbackTimeoutId = timeoutId;
    } else {
      clearTimeout(timeoutId);
    }
  }

  private async resolveAccountMessageFromSnapshot({
    key,
    partyId,
    payload,
    previousLatestAccountMessageId,
  }: {
    key: string;
    partyId: string;
    payload: SendChatMessageRequestDto;
    previousLatestAccountMessageId?: string;
  }) {
    if (!this.pendingSpecialMessageRequests.has(key)) {
      return;
    }

    logAccountMessageLifecycle('snapshot-fallback-start', {
      partyId,
      previousLatestAccountMessageId,
    });

    const source = await this.loadPartyChat(partyId, true);
    const latestAccountMessage = this.getLatestAccountMessage(source);

    if (
      !latestAccountMessage ||
      latestAccountMessage.id === previousLatestAccountMessageId ||
      !this.matchesAccountPayload(latestAccountMessage, payload)
    ) {
      logAccountMessageLifecycle('snapshot-fallback-miss', {
        latestAccountMessageId: latestAccountMessage?.id,
        partyId,
      });
      return;
    }

    logAccountMessageLifecycle('snapshot-fallback-hit', {
      latestAccountMessageId: latestAccountMessage.id,
      partyId,
    });
    this.clearPendingSpecialMessageRequest(key);
  }

  private clearPendingSpecialMessageRequest(
    key: string,
    error?: Error,
  ) {
    const pendingRequest = this.pendingSpecialMessageRequests.get(key);

    if (!pendingRequest) {
      return;
    }

    clearTimeout(pendingRequest.timeoutId);
    if (pendingRequest.snapshotFallbackTimeoutId) {
      clearTimeout(pendingRequest.snapshotFallbackTimeoutId);
    }
    this.pendingSpecialMessageRequests.delete(key);

    logAccountMessageLifecycle('pending-clear', {
      error: error?.message,
      key,
    });

    if (error) {
      pendingRequest.reject(error);
      return;
    }

    const partyId = key.split(':')[0];
    const state = this.partyStates.get(partyId);
    pendingRequest.resolve(state?.source ? clonePartySource(state.source) : null);
  }

  private async publishSpecialMessage(
    partyId: string,
    payload: SendChatMessageRequestDto,
  ): Promise<TaxiChatSourceData | null> {
    const client = await this.ensureStompClient();
    const key = this.buildSpecialMessageKey(partyId);
    const previousLatestAccountMessageId = this.getLatestAccountMessage(
      this.partyStates.get(partyId)?.source,
    )?.id;

    this.clearPendingSpecialMessageRequest(
      key,
      createStompRepositoryError('이전 특수 메시지 요청이 새 요청으로 대체되었습니다.'),
    );

    const responsePromise = new Promise<TaxiChatSourceData | null>(
      (resolve, reject) => {
        const timeoutId = setTimeout(() => {
          logAccountMessageLifecycle('timeout', {
            chatMessageType: payload.type,
            partyId,
          });
          this.clearPendingSpecialMessageRequest(
            key,
            createStompRepositoryError(
              '특수 메시지 전송 결과를 제시간에 확인하지 못했습니다.',
              {
                chatMessageType: payload.type,
                partyId,
              },
            ),
          );
        }, SPECIAL_MESSAGE_TIMEOUT_MS);

        this.pendingSpecialMessageRequests.set(key, {
          reject,
          resolve,
          snapshotFallbackTimeoutId: null,
          timeoutId,
        });
      },
    );

    logAccountMessageLifecycle('publish', {
      partyId,
      previousLatestAccountMessageId,
    });
    client.publish({
      body: JSON.stringify(payload),
      destination: `/app/chat/${resolveTaxiChatRoomId(partyId)}`,
    });
    this.queueAccountSnapshotFallback({
      key,
      partyId,
      payload,
      previousLatestAccountMessageId,
    });

    return responsePromise;
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
    this.pendingSpecialMessageRequests.forEach((_, key) => {
      this.clearPendingSpecialMessageRequest(
        key,
        createStompRepositoryError(
          '채팅 세션이 정리되어 특수 메시지 대기 요청을 종료했습니다.',
        ),
      );
    });
    this.partyStates.clear();
  }

  private async deactivateStompClient() {
    const client = this.stompClient;

    this.stompClientGeneration += 1;
    this.stompClient = null;
    this.stompConnectionPromise = null;
    this.errorSubscription = null;
    this.pendingSpecialMessageRequests.forEach((_, key) => {
      this.clearPendingSpecialMessageRequest(
        key,
        createStompRepositoryError(
          '채팅 연결이 종료되어 특수 메시지 전송을 마무리하지 못했습니다.',
        ),
      );
    });

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

        logAccountMessageLifecycle('error-queue', {
          apiErrorCode: payload?.errorCode,
          message,
        });
        this.pendingSpecialMessageRequests.forEach((_, key) => {
          this.clearPendingSpecialMessageRequest(key, error);
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
    logStompLifecycle('room-subscribe', {
      partyId,
      topic: `/topic/chat/${resolveTaxiChatRoomId(partyId)}`,
    });
  }

  private async ensureStompClient(): Promise<Client> {
    if (this.stompClient?.connected) {
      logStompLifecycle('connect-reuse-connected', {
        currentPartyId: this.currentPartyId,
      });
      return this.stompClient;
    }

    if (this.stompConnectionPromise) {
      logStompLifecycle('connect-reuse-pending', {
        currentPartyId: this.currentPartyId,
      });
      return this.stompConnectionPromise;
    }

    if (!this.stompClient) {
      this.stompClient = new Client();
    }

    const client = this.stompClient;
    const generation = ++this.stompClientGeneration;
    logStompLifecycle('connect-start', {
      currentPartyId: this.currentPartyId,
      generation,
    });

    this.stompConnectionPromise = new Promise<Client>((resolve, reject) => {
      let settled = false;
      let connectTimeoutHandle: ReturnType<typeof setTimeout> | null =
        setTimeout(() => {
          const error = createStompRepositoryError(
            '채팅 실시간 연결 시간이 초과되었습니다.',
            {
              timeoutMs: STOMP_CONNECT_TIMEOUT_MS,
            },
          );

          logStompLifecycle('connect-timeout', {
            currentPartyId: this.currentPartyId,
            generation,
            timeoutMs: STOMP_CONNECT_TIMEOUT_MS,
          });
          safeReject(error);
          this.deactivateStompClient().catch(() => undefined);
        }, STOMP_CONNECT_TIMEOUT_MS);

      const clearConnectTimeout = () => {
        if (!connectTimeoutHandle) {
          return;
        }

        clearTimeout(connectTimeoutHandle);
        connectTimeoutHandle = null;
      };

      const safeReject = (error: RepositoryError) => {
        if (settled) {
          return;
        }

        settled = true;
        clearConnectTimeout();
        reject(error);
      };

      client.debug = message => {
        logStompLifecycle('client-debug', {
          currentPartyId: this.currentPartyId,
          generation,
          message,
        });
      };

      client.beforeConnect = async () => {
        logStompLifecycle('before-connect-start', {
          currentPartyId: this.currentPartyId,
          generation,
        });

        try {
          const options = await chatSocketClient.buildConnectionOptions({
            endpointPath: buildNativeStompWebSocketPath(),
          });

          client.brokerURL = undefined;
          client.connectHeaders = options.connectHeaders;
          client.stompVersions = new Versions(['1.2']);
          client.webSocketFactory = () =>
            new WebSocket(options.url, STOMP_NATIVE_PROTOCOL);
          client.heartbeatIncoming = options.heartbeatIncomingMs;
          client.heartbeatOutgoing = options.heartbeatOutgoingMs;
          client.reconnectDelay = options.reconnectDelayMs;
          client.appendMissingNULLonIncoming = true;
          logStompLifecycle('before-connect-ready', {
            hasAuthorizationHeader:
              typeof options.connectHeaders.Authorization === 'string' &&
              options.connectHeaders.Authorization.startsWith('Bearer '),
            currentPartyId: this.currentPartyId,
            generation,
            headerKeys: Object.keys(options.connectHeaders),
            protocol: STOMP_NATIVE_PROTOCOL,
            url: options.url,
          });
        } catch (error) {
          const repositoryError = createStompRepositoryError(
            '채팅 실시간 연결 준비에 실패했습니다.',
            {
              cause: error,
            },
          );

          logStompLifecycle('before-connect-error', {
            currentPartyId: this.currentPartyId,
            generation,
            message: repositoryError.message,
          });
          safeReject(repositoryError);
          throw repositoryError;
        }
      };

      client.onConnect = () => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        logStompLifecycle('connect-success', {
          currentPartyId: this.currentPartyId,
          generation,
        });

        this.ensureErrorSubscription();
        this.partyStates.forEach((state, partyId) => {
          if (state.subscribers.size > 0) {
            this.ensureRoomSubscription(partyId);
          }
        });

        if (!settled) {
          settled = true;
          clearConnectTimeout();
          resolve(client);
        }
      };

      client.onDisconnect = () => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        logStompLifecycle('disconnect', {
          currentPartyId: this.currentPartyId,
          generation,
        });
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

        logStompLifecycle('stomp-error', {
          currentPartyId: this.currentPartyId,
          generation,
          message: error.message,
        });
        this.notifyPartySubscribers(error);
        safeReject(error);
      };

      client.onWebSocketClose = event => {
        if (!this.isCurrentStompClient(client, generation)) {
          return;
        }

        logStompLifecycle('websocket-close', {
          code: event.code,
          currentPartyId: this.currentPartyId,
          generation,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        this.clearStompSubscriptions();

        if (!settled) {
          safeReject(
            createStompRepositoryError(
              '채팅 실시간 연결이 닫혔습니다.',
              {
                closeCode: event.code,
                closeReason: event.reason,
                wasClean: event.wasClean,
              },
            ),
          );
        }
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

        logStompLifecycle('websocket-error', {
          currentPartyId: this.currentPartyId,
          generation,
          message: error.message,
        });
        safeReject(error);
      };

      logStompLifecycle('activate', {
        currentPartyId: this.currentPartyId,
        generation,
      });
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
    const mappedMessage = mapTaxiChatMessageDto(message);
    const specialMessageKey = this.buildSpecialMessageKey(partyId);

    if (mappedMessage.type === 'account') {
      logAccountMessageLifecycle('topic-received', {
        messageId: message.id,
        partyId,
      });
    }

    if (!state.source) {
      await this.loadPartyChat(partyId, true);
      if (mappedMessage.type === 'account') {
        this.clearPendingSpecialMessageRequest(
          specialMessageKey,
        );
      }
      return;
    }

    if (state.source.messages.some(item => item.id === message.id)) {
      if (mappedMessage.type === 'account') {
        logAccountMessageLifecycle('topic-duplicate', {
          messageId: message.id,
          partyId,
        });
        this.clearPendingSpecialMessageRequest(specialMessageKey);
      }
      return;
    }

    state.source = {
      ...state.source,
      latestAccountData:
        mappedMessage.type === 'account' && mappedMessage.accountData
          ? mappedMessage.accountData
          : state.source.latestAccountData,
      messages: [
        ...state.source.messages,
        mappedMessage,
      ],
    };
    this.publishPartyState(partyId);

    if (mappedMessage.type === 'account') {
      this.clearPendingSpecialMessageRequest(
        specialMessageKey,
      );
    }
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
