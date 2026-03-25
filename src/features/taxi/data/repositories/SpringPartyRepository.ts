import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import {RepositoryError, RepositoryErrorCode} from '@/shared/lib/errors';
import {
  createXhrSseStream,
  sseClient,
  type SseStreamConnection,
} from '@/shared/realtime';

import {taxiHomeApiClient} from '../api/taxiHomeApiClient';
import type {JoinRequestListItemResponseDto} from '../dto/taxiHomeDto';
import {
  isActivePartyStatusDto,
  mapJoinRequestListItemDtoToJoinRequest,
  mapJoinRequestListItemDtoToStatus,
  mapPartyDetailResponseDtoToParty,
} from '../mappers/taxiPartyMapper';
import type {
  AccountMessageData,
  ArrivalMessageData,
  JoinRequest,
  JoinRequestStatus,
  Party,
  PartyMessage,
  PendingJoinRequest,
  SettlementData,
} from '../../model/types';
import type {IPartyRepository} from './IPartyRepository';

const DEFAULT_SSE_RECONNECT_DELAY_MS = 3000;

type SseSignalQuery = Record<string, string>;

interface SharedSseSignalStream {
  connection: SseStreamConnection | null;
  connectionPromise: Promise<void> | null;
  key: string;
  label: string;
  lastEventId?: string;
  listeners: Set<() => void>;
  path: string;
  query?: SseSignalQuery;
  reconnectDelayMs: number;
  reconnectTimerId: ReturnType<typeof setTimeout> | null;
}

const formatLocalDateTime = (value: string) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  const pad = (part: number) => `${part}`.padStart(2, '0');

  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
    parsedDate.getDate(),
  )}T${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}:${pad(
    parsedDate.getSeconds(),
  )}`;
};

const toError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error('파티 데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.');
};

export class SpringPartyRepository implements IPartyRepository {
  private readonly refreshers = new Set<() => Promise<void>>();

  private readonly signalStreams = new Map<string, SharedSseSignalStream>();

  private subscribeWithSignals<T>({
    callbacks,
    load,
    connectSignals,
  }: {
    callbacks: SubscriptionCallbacks<T>;
    load: () => Promise<T>;
    connectSignals?: (refresh: () => void) => Promise<Unsubscribe>;
  }): Unsubscribe {
    let active = true;
    let inFlight: Promise<void> | null = null;
    let signalCleanup: Unsubscribe | null = null;

    const refresh = async () => {
      if (!active) {
        return;
      }

      if (inFlight) {
        return inFlight;
      }

      inFlight = load()
        .then(data => {
          if (active) {
            callbacks.onData(data);
          }
        })
        .catch(error => {
          if (active) {
            callbacks.onError(toError(error));
          }
        })
        .finally(() => {
          inFlight = null;
        });

      return inFlight;
    };

    const triggerRefresh = () => {
      refresh().catch(() => undefined);
    };

    this.refreshers.add(refresh);
    triggerRefresh();

    if (connectSignals) {
      connectSignals(triggerRefresh)
        .then(cleanup => {
          if (!active) {
            cleanup();
            return;
          }

          signalCleanup = cleanup;
        })
        .catch(error => {
          if (active) {
            callbacks.onError(toError(error));
          }
        });
    }

    return () => {
      active = false;
      signalCleanup?.();
      this.refreshers.delete(refresh);
    };
  }

  private async refreshActiveSubscriptions() {
    const refreshers = Array.from(this.refreshers);

    if (refreshers.length === 0) {
      return;
    }

    await Promise.allSettled(refreshers.map(refresh => refresh()));
  }

  private async getActiveMyPartyId(): Promise<string | null> {
    const myPartiesResponse = await taxiHomeApiClient.getMyParties();
    const activeParty =
      myPartiesResponse.data.find(party =>
        isActivePartyStatusDto(party.status),
      ) ?? null;

    return activeParty?.id ?? null;
  }

  private async getActiveLeaderPartyIds(): Promise<string[]> {
    const myPartiesResponse = await taxiHomeApiClient.getMyParties();

    return myPartiesResponse.data
      .filter(party => party.isLeader && isActivePartyStatusDto(party.status))
      .map(party => party.id);
  }

  private async findJoinRequestInLeaderQueues(
    requestId: string,
  ): Promise<JoinRequestListItemResponseDto | null> {
    const leaderPartyIds = await this.getActiveLeaderPartyIds();

    for (const partyId of leaderPartyIds) {
      const joinRequestsResponse = await taxiHomeApiClient.getPartyJoinRequests(
        partyId,
      );
      const match =
        joinRequestsResponse.data.find(request => request.id === requestId) ??
        null;

      if (match) {
        return match;
      }
    }

    return null;
  }

  private async loadJoinRequestStatus(
    requestId: string,
  ): Promise<JoinRequestStatus | null> {
    try {
      const myJoinRequestsResponse =
        await taxiHomeApiClient.getMyJoinRequests();
      const myRequest =
        myJoinRequestsResponse.data.find(request => request.id === requestId) ??
        null;

      if (myRequest) {
        return mapJoinRequestListItemDtoToStatus(myRequest);
      }

      const leaderQueueRequest = await this.findJoinRequestInLeaderQueues(
        requestId,
      );

      return leaderQueueRequest
        ? mapJoinRequestListItemDtoToStatus(leaderQueueRequest)
        : null;
    } catch (error) {
      if (
        error instanceof RepositoryError &&
        error.code === RepositoryErrorCode.NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
  }

  private async connectSignalGroup(
    connectors: Array<() => Promise<Unsubscribe>>,
  ): Promise<Unsubscribe> {
    const cleanups: Unsubscribe[] = [];

    try {
      for (const connect of connectors) {
        cleanups.push(await connect());
      }
    } catch (error) {
      cleanups.forEach(cleanup => cleanup());
      throw error;
    }

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }

  private normalizeSignalQuery(
    query?: Record<string, string | undefined>,
  ): SseSignalQuery | undefined {
    if (!query) {
      return undefined;
    }

    const normalizedEntries: Array<[string, string]> = Object.entries(query)
      .filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === 'string' && entry[1].length > 0,
      )
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));

    if (normalizedEntries.length === 0) {
      return undefined;
    }

    return Object.fromEntries(normalizedEntries);
  }

  private createSignalStreamKey(path: string, query?: SseSignalQuery) {
    if (!query) {
      return path;
    }

    const serializedQuery = Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return serializedQuery.length > 0 ? `${path}?${serializedQuery}` : path;
  }

  private getOrCreateSignalStream({
    label,
    path,
    query,
  }: {
    label: string;
    path: string;
    query?: Record<string, string | undefined>;
  }): SharedSseSignalStream {
    const normalizedQuery = this.normalizeSignalQuery(query);
    const key = this.createSignalStreamKey(path, normalizedQuery);
    const existingStream = this.signalStreams.get(key);

    if (existingStream) {
      return existingStream;
    }

    const nextStream: SharedSseSignalStream = {
      connection: null,
      connectionPromise: null,
      key,
      label,
      listeners: new Set(),
      path,
      query: normalizedQuery,
      reconnectDelayMs: DEFAULT_SSE_RECONNECT_DELAY_MS,
      reconnectTimerId: null,
    };

    this.signalStreams.set(key, nextStream);
    return nextStream;
  }

  private clearSignalStreamReconnectTimer(stream: SharedSseSignalStream) {
    if (!stream.reconnectTimerId) {
      return;
    }

    clearTimeout(stream.reconnectTimerId);
    stream.reconnectTimerId = null;
  }

  private notifySignalStreamListeners(stream: SharedSseSignalStream) {
    Array.from(stream.listeners).forEach(listener => {
      listener();
    });
  }

  private disposeSignalStreamIfIdle(stream: SharedSseSignalStream) {
    if (stream.listeners.size > 0) {
      return;
    }

    this.clearSignalStreamReconnectTimer(stream);

    const currentConnection = stream.connection;
    stream.connection = null;
    currentConnection?.close();

    if (!stream.connectionPromise) {
      this.signalStreams.delete(stream.key);
    }
  }

  private scheduleSignalStreamReconnect(stream: SharedSseSignalStream) {
    if (stream.listeners.size === 0 || stream.reconnectTimerId) {
      return;
    }

    stream.reconnectTimerId = setTimeout(() => {
      stream.reconnectTimerId = null;
      this.connectSignalStream(stream).catch(() => undefined);
    }, stream.reconnectDelayMs);
  }

  private async connectSignalStream(stream: SharedSseSignalStream) {
    if (
      stream.listeners.size === 0 ||
      stream.connection ||
      stream.connectionPromise
    ) {
      return stream.connectionPromise ?? undefined;
    }

    stream.connectionPromise = sseClient
      .connect(
        {
          lastEventId: stream.lastEventId,
          path: stream.path,
          query: stream.query,
        },
        {
          connect: options => {
            stream.reconnectDelayMs = options.reconnectDelayMs;

            let nextConnection: SseStreamConnection | null = null;
            nextConnection = createXhrSseStream(options, {
              onClosed: () => {
                if (stream.connection === nextConnection) {
                  stream.connection = null;
                }

                this.scheduleSignalStreamReconnect(stream);
                this.disposeSignalStreamIfIdle(stream);
              },
              onError: error => {
                if (stream.listeners.size === 0) {
                  return;
                }

                console.warn(`[TaxiParty] ${stream.label} SSE 연결 오류`, error);
              },
              onEvent: event => {
                if (event.id) {
                  stream.lastEventId = event.id;
                }

                if (event.event === 'HEARTBEAT') {
                  return;
                }

                this.notifySignalStreamListeners(stream);
              },
              onOpen: () => {
                this.notifySignalStreamListeners(stream);
              },
            });

            stream.connection = nextConnection;
            return nextConnection;
          },
        },
      )
      .then(() => undefined)
      .catch(error => {
        if (stream.listeners.size === 0) {
          return;
        }

        console.warn(`[TaxiParty] ${stream.label} SSE 연결 실패`, error);
        this.scheduleSignalStreamReconnect(stream);
      })
      .finally(() => {
        stream.connectionPromise = null;
        this.disposeSignalStreamIfIdle(stream);
      });

    await stream.connectionPromise;
  }

  private async openSseSignalStream({
    label,
    path,
    query,
    onSignal,
  }: {
    label: string;
    onSignal: () => void;
    path: string;
    query?: Record<string, string | undefined>;
  }): Promise<Unsubscribe> {
    const stream = this.getOrCreateSignalStream({
      label,
      path,
      query,
    });

    stream.listeners.add(onSignal);
    await this.connectSignalStream(stream);

    return () => {
      stream.listeners.delete(onSignal);
      this.disposeSignalStreamIfIdle(stream);
    };
  }

  private connectPartiesSignals(onSignal: () => void) {
    return this.openSseSignalStream({
      label: 'parties',
      onSignal,
      path: '/v1/sse/parties',
    });
  }

  private connectPartyJoinRequestSignals(
    partyId: string,
    onSignal: () => void,
  ) {
    return this.openSseSignalStream({
      label: `party ${partyId} join requests`,
      onSignal,
      path: `/v1/sse/parties/${partyId}/join-requests`,
    });
  }

  private connectMyJoinRequestSignals(
    onSignal: () => void,
    status?: 'PENDING',
  ) {
    return this.openSseSignalStream({
      label: status ? `my join requests (${status})` : 'my join requests',
      onSignal,
      path: '/v1/sse/members/me/join-requests',
      query: status ? {status} : undefined,
    });
  }

  private async connectLeaderJoinRequestSignals(
    onSignal: () => void,
  ): Promise<Unsubscribe> {
    let active = true;
    let partiesCleanup: Unsubscribe | null = null;
    const partyJoinRequestCleanups = new Map<string, Unsubscribe>();
    let syncPromise: Promise<void> | null = null;

    const syncPartyStreams = async () => {
      if (!active || syncPromise) {
        return syncPromise;
      }

      syncPromise = (async () => {
        try {
          const leaderPartyIds = await this.getActiveLeaderPartyIds();
          const nextPartyIds = new Set(leaderPartyIds);

          Array.from(partyJoinRequestCleanups.entries()).forEach(
            ([partyId, cleanup]) => {
              if (nextPartyIds.has(partyId)) {
                return;
              }

              cleanup();
              partyJoinRequestCleanups.delete(partyId);
            },
          );

          for (const partyId of leaderPartyIds) {
            if (partyJoinRequestCleanups.has(partyId)) {
              continue;
            }

            const cleanup = await this.connectPartyJoinRequestSignals(
              partyId,
              onSignal,
            );

            if (!active) {
              cleanup();
              return;
            }

            partyJoinRequestCleanups.set(partyId, cleanup);
          }
        } catch (error) {
          if (active) {
            console.warn(
              '[TaxiParty] leader join request SSE 구독 대상을 동기화하지 못했습니다.',
              error,
            );
          }
        } finally {
          syncPromise = null;
        }
      })();

      return syncPromise;
    };

    partiesCleanup = await this.connectPartiesSignals(() => {
      onSignal();
      syncPartyStreams().catch(() => undefined);
    });

    await syncPartyStreams();

    return () => {
      active = false;
      partiesCleanup?.();
      partyJoinRequestCleanups.forEach(cleanup => cleanup());
      partyJoinRequestCleanups.clear();
    };
  }

  subscribeToParties(callbacks: SubscriptionCallbacks<Party[]>): Unsubscribe {
    return this.subscribeWithSignals({
      callbacks,
      connectSignals: refresh => this.connectPartiesSignals(refresh),
      load: async () => {
        const partiesResponse = await taxiHomeApiClient.getOpenParties();
        const parties = await Promise.all(
          partiesResponse.data.content.map(summary =>
            this.getParty(summary.id),
          ),
        );

        return parties.filter((party): party is Party => party !== null);
      },
    });
  }

  subscribeToParty(
    partyId: string,
    callbacks: SubscriptionCallbacks<Party | null>,
  ): Unsubscribe {
    return this.subscribeWithSignals({
      callbacks,
      connectSignals: refresh => this.connectPartiesSignals(refresh),
      load: () => this.getParty(partyId),
    });
  }

  subscribeToMyParty(
    _userId: string,
    callbacks: SubscriptionCallbacks<Party | null>,
  ): Unsubscribe {
    return this.subscribeWithSignals({
      callbacks,
      connectSignals: refresh => this.connectPartiesSignals(refresh),
      load: async () => {
        const activePartyId = await this.getActiveMyPartyId();

        if (!activePartyId) {
          return null;
        }

        return this.getParty(activePartyId);
      },
    });
  }

  async createParty(party: Omit<Party, 'id'>): Promise<string> {
    const response = await taxiHomeApiClient.createParty({
      departure: {
        lat: party.departure.lat,
        lng: party.departure.lng,
        name: party.departure.name,
      },
      departureTime: formatLocalDateTime(party.departureTime),
      destination: {
        lat: party.destination.lat,
        lng: party.destination.lng,
        name: party.destination.name,
      },
      detail: party.detail?.trim() || undefined,
      maxMembers: party.maxMembers,
      tags: party.tags?.map(tag => tag.trim()).filter(Boolean),
    });

    await this.refreshActiveSubscriptions();

    return response.data.id;
  }

  async updateParty(partyId: string, updates: Partial<Party>): Promise<void> {
    const payload = {
      departureTime:
        typeof updates.departureTime === 'string'
          ? formatLocalDateTime(updates.departureTime)
          : undefined,
      detail:
        typeof updates.detail === 'string' ? updates.detail.trim() : undefined,
    };

    if (!payload.departureTime && !payload.detail) {
      throw new RepositoryError(
        RepositoryErrorCode.INVALID_ARGUMENT,
        '출발 시간 또는 상세 설명 중 하나는 수정해야 합니다.',
      );
    }

    await taxiHomeApiClient.updateParty(partyId, payload);
    await this.refreshActiveSubscriptions();
  }

  async deleteParty(
    partyId: string,
    reason: Party['endReason'],
  ): Promise<void> {
    if (reason && reason !== 'cancelled') {
      throw new RepositoryError(
        RepositoryErrorCode.INVALID_ARGUMENT,
        'Spring 파티 저장소는 취소 종료만 지원합니다.',
        {
          context: {
            reason,
          },
        },
      );
    }

    await taxiHomeApiClient.cancelParty(partyId);
    await this.refreshActiveSubscriptions();
  }

  async closeParty(partyId: string): Promise<void> {
    await taxiHomeApiClient.closeParty(partyId);
    await this.refreshActiveSubscriptions();
  }

  async reopenParty(partyId: string): Promise<void> {
    await taxiHomeApiClient.reopenParty(partyId);
    await this.refreshActiveSubscriptions();
  }

  async endParty(partyId: string): Promise<void> {
    await taxiHomeApiClient.endParty(partyId);
    await this.refreshActiveSubscriptions();
  }

  async addMember(_partyId: string, _userId: string): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '직접 멤버 추가는 지원하지 않습니다. 동승 요청 수락 흐름을 사용해주세요.',
    );
  }

  async removeMember(partyId: string, userId: string): Promise<void> {
    await taxiHomeApiClient.kickMember(partyId, userId);
    await this.refreshActiveSubscriptions();
  }

  async leaveParty(partyId: string): Promise<void> {
    await taxiHomeApiClient.leaveParty(partyId);
    await this.refreshActiveSubscriptions();
  }

  async getParty(partyId: string): Promise<Party | null> {
    try {
      const response = await taxiHomeApiClient.getParty(partyId);
      return mapPartyDetailResponseDtoToParty(response.data);
    } catch (error) {
      if (
        error instanceof RepositoryError &&
        error.code === RepositoryErrorCode.NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
  }

  subscribeToJoinRequestCount(
    _leaderId: string,
    callbacks: SubscriptionCallbacks<number>,
  ): Unsubscribe {
    return this.subscribeWithSignals({
      callbacks,
      connectSignals: refresh => this.connectLeaderJoinRequestSignals(refresh),
      load: async () => {
        const leaderPartyIds = await this.getActiveLeaderPartyIds();

        if (leaderPartyIds.length === 0) {
          return 0;
        }

        const joinRequestResponses = await Promise.all(
          leaderPartyIds.map(partyId =>
            taxiHomeApiClient.getPartyJoinRequests(partyId),
          ),
        );

        return joinRequestResponses.reduce((count, response) => {
          return (
            count +
            response.data.filter(request => request.status === 'PENDING').length
          );
        }, 0);
      },
    });
  }

  subscribeToMyPendingJoinRequest(
    _requesterId: string,
    callbacks: SubscriptionCallbacks<PendingJoinRequest | null>,
  ): Unsubscribe {
    return this.subscribeWithSignals({
      callbacks,
      connectSignals: refresh =>
        this.connectMyJoinRequestSignals(refresh, 'PENDING'),
      load: async () => {
        const response = await taxiHomeApiClient.getMyJoinRequests({
          status: 'PENDING',
        });
        const pendingRequest = response.data[0];

        if (!pendingRequest) {
          return null;
        }

        return {
          partyId: pendingRequest.partyId,
          requestId: pendingRequest.id,
        };
      },
    });
  }

  subscribeToJoinRequest(
    requestId: string,
    callbacks: SubscriptionCallbacks<JoinRequestStatus | null>,
  ): Unsubscribe {
    return this.subscribeWithSignals({
      callbacks,
      connectSignals: refresh =>
        this.connectSignalGroup([
          () => this.connectMyJoinRequestSignals(refresh),
          () => this.connectLeaderJoinRequestSignals(refresh),
        ]),
      load: () => this.loadJoinRequestStatus(requestId),
    });
  }

  async cancelJoinRequest(requestId: string): Promise<void> {
    await taxiHomeApiClient.cancelJoinRequest(requestId);
    await this.refreshActiveSubscriptions();
  }

  async createJoinRequest(
    partyId: string,
    _leaderId: string,
    _requesterId: string,
  ): Promise<string> {
    const response = await taxiHomeApiClient.createJoinRequest(partyId);
    await this.refreshActiveSubscriptions();
    return response.data.id;
  }

  async sendPartyMessage(
    _partyId: string,
    _senderId: string,
    _text: string,
  ): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '파티 채팅 메시지는 taxiChatRepository를 통해 전송해야 합니다.',
    );
  }

  async sendSystemMessage(_partyId: string, _text: string): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '파티 시스템 메시지는 Spring backend가 자동으로 생성하므로 클라이언트에서 직접 전송할 수 없습니다.',
    );
  }

  async sendAccountMessage(
    _partyId: string,
    _senderId: string,
    _accountData: AccountMessageData,
  ): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '파티 채팅 메시지는 taxiChatRepository를 통해 전송해야 합니다.',
    );
  }

  async sendArrivedMessage(
    _partyId: string,
    _senderId: string,
    _arrivalData: ArrivalMessageData,
  ): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '도착/정산 메시지는 taxiChatRepository를 통해 전송해야 합니다.',
    );
  }

  async sendEndMessage(
    _partyId: string,
    _senderId: string,
    _partyArrived: boolean,
  ): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '종료 메시지는 taxiChatRepository를 통해 전송해야 합니다.',
    );
  }

  subscribeToPartyMessages(
    _partyId: string,
    callbacks: SubscriptionCallbacks<PartyMessage[]>,
  ): Unsubscribe {
    callbacks.onError(
      new RepositoryError(
        RepositoryErrorCode.INVALID_ARGUMENT,
        '파티 채팅 구독은 taxiChatRepository를 통해 사용해야 합니다.',
      ),
    );

    return () => {};
  }

  subscribeToJoinRequests(
    partyId: string,
    callbacks: SubscriptionCallbacks<JoinRequest[]>,
  ): Unsubscribe {
    return this.subscribeWithSignals({
      callbacks,
      connectSignals: refresh =>
        this.connectPartyJoinRequestSignals(partyId, refresh),
      load: async () => {
        const [party, joinRequestsResponse] = await Promise.all([
          this.getParty(partyId),
          taxiHomeApiClient.getPartyJoinRequests(partyId),
        ]);

        return joinRequestsResponse.data.map(dto =>
          mapJoinRequestListItemDtoToJoinRequest({
            dto,
            leaderId: party?.leaderId ?? '',
          }),
        );
      },
    });
  }

  async acceptJoinRequest(
    requestId: string,
    _partyId: string,
    _requesterId?: string,
  ): Promise<void> {
    await taxiHomeApiClient.acceptJoinRequest(requestId);
    await this.refreshActiveSubscriptions();
  }

  async declineJoinRequest(requestId: string): Promise<void> {
    await taxiHomeApiClient.declineJoinRequest(requestId);
    await this.refreshActiveSubscriptions();
  }

  async getPartyChatMuted(_partyId: string, _userId: string): Promise<boolean> {
    return false;
  }

  async setPartyChatMuted(
    _partyId: string,
    _userId: string,
    _muted: boolean,
  ): Promise<void> {}

  async startSettlement(
    partyId: string,
    settlementData: SettlementData,
  ): Promise<void> {
    await taxiHomeApiClient.arriveParty(partyId, {
      account: {
        accountHolder: settlementData.account.accountHolder,
        accountNumber: settlementData.account.accountNumber,
        bankName: settlementData.account.bankName,
        hideName: settlementData.account.hideName,
      },
      settlementTargetMemberIds: settlementData.settlementTargetMemberIds,
      taxiFare: settlementData.taxiFare,
    });
    await this.refreshActiveSubscriptions();
  }

  async markMemberSettled(partyId: string, memberId: string): Promise<void> {
    await taxiHomeApiClient.confirmSettlement(partyId, memberId);
    await this.refreshActiveSubscriptions();
  }

  async completeSettlement(_partyId: string): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      'Spring backend에 별도 정산 완료 write contract가 없습니다.',
    );
  }
}
