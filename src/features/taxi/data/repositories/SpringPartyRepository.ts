import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import {RepositoryError, RepositoryErrorCode} from '@/shared/lib/errors';

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

const DEFAULT_POLL_INTERVAL_MS = 8000;
const PARTY_LIST_POLL_INTERVAL_MS = 12000;

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

  private subscribeWithPolling<T>({
    callbacks,
    load,
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  }: {
    callbacks: SubscriptionCallbacks<T>;
    load: () => Promise<T>;
    pollIntervalMs?: number;
  }): Unsubscribe {
    let active = true;
    let inFlight: Promise<void> | null = null;

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

    this.refreshers.add(refresh);
    refresh().catch(() => undefined);

    const timerId = setInterval(() => {
      refresh().catch(() => undefined);
    }, pollIntervalMs);

    return () => {
      active = false;
      clearInterval(timerId);
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

  subscribeToParties(callbacks: SubscriptionCallbacks<Party[]>): Unsubscribe {
    return this.subscribeWithPolling({
      callbacks,
      load: async () => {
        const partiesResponse = await taxiHomeApiClient.getOpenParties();
        const parties = await Promise.all(
          partiesResponse.data.content.map(summary =>
            this.getParty(summary.id),
          ),
        );

        return parties.filter((party): party is Party => party !== null);
      },
      pollIntervalMs: PARTY_LIST_POLL_INTERVAL_MS,
    });
  }

  subscribeToParty(
    partyId: string,
    callbacks: SubscriptionCallbacks<Party | null>,
  ): Unsubscribe {
    return this.subscribeWithPolling({
      callbacks,
      load: () => this.getParty(partyId),
    });
  }

  subscribeToMyParty(
    _userId: string,
    callbacks: SubscriptionCallbacks<Party | null>,
  ): Unsubscribe {
    return this.subscribeWithPolling({
      callbacks,
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

  async addMember(_partyId: string, _userId: string): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '직접 멤버 추가는 지원하지 않습니다. 동승 요청 수락 흐름을 사용해주세요.',
    );
  }

  async removeMember(_partyId: string, _userId: string): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '직접 멤버 제거는 지원하지 않습니다. 파티 나가기/강퇴 전용 API를 사용해주세요.',
    );
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
    return this.subscribeWithPolling({
      callbacks,
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
    return this.subscribeWithPolling({
      callbacks,
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
    return this.subscribeWithPolling({
      callbacks,
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
    // Phase E에서는 system message 전용 write contract가 없어 REST leader flow만 우선 연결한다.
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
    return this.subscribeWithPolling({
      callbacks,
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
    _requesterId: string,
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
    _partyId: string,
    _settlementData: SettlementData,
  ): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '정산 시작은 아직 partyRepository Spring 경계에 포함되지 않았습니다.',
    );
  }

  async markMemberSettled(_partyId: string, _memberId: string): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '멤버 정산 완료는 아직 partyRepository Spring 경계에 포함되지 않았습니다.',
    );
  }

  async completeSettlement(_partyId: string): Promise<void> {
    throw new RepositoryError(
      RepositoryErrorCode.INVALID_ARGUMENT,
      '정산 완료는 아직 partyRepository Spring 경계에 포함되지 않았습니다.',
    );
  }
}
