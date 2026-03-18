import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

import type {
  IPartyRepository,
} from './IPartyRepository';
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

const parties = new Map<string, Party>();
const joinRequests = new Map<string, JoinRequest>();
const partyMessages = new Map<string, PartyMessage[]>();
const partyChatMuted = new Map<string, boolean>();

const partySubscribers = new Set<SubscriptionCallbacks<Party[]>>();
const partyDetailSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<Party | null>>
>();
const myPartySubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<Party | null>>
>();
const joinRequestCountSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<number>>
>();
const pendingJoinRequestSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<PendingJoinRequest | null>>
>();
const joinRequestSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<JoinRequestStatus | null>>
>();
const joinRequestsSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<JoinRequest[]>>
>();
const partyMessageSubscribers = new Map<
  string,
  Set<SubscriptionCallbacks<PartyMessage[]>>
>();

const nowIso = () => new Date();
const nextId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const toTimestamp = (value: unknown) => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value).getTime();
  }

  return 0;
};

const cloneParty = (party: Party): Party => ({
  ...party,
  members: [...party.members],
  tags: party.tags ? [...party.tags] : undefined,
  departure: { ...party.departure },
  destination: { ...party.destination },
  settlement: party.settlement
    ? {
        ...party.settlement,
        members: Object.entries(party.settlement.members).reduce<Record<string, { settled: boolean; settledAt?: unknown }>>(
          (accumulator, [memberId, member]) => {
            accumulator[memberId] = { ...member };
            return accumulator;
          },
          {},
        ),
      }
    : undefined,
  createdAt: party.createdAt instanceof Date ? new Date(party.createdAt) : party.createdAt,
  updatedAt: party.updatedAt instanceof Date ? new Date(party.updatedAt) : party.updatedAt,
  endedAt: party.endedAt instanceof Date ? new Date(party.endedAt) : party.endedAt,
});

const cloneJoinRequest = (request: JoinRequest): JoinRequest => ({
  ...request,
  createdAt: request.createdAt instanceof Date ? new Date(request.createdAt) : request.createdAt,
});

const cloneMessage = (message: PartyMessage): PartyMessage => ({
  ...message,
  accountData: message.accountData ? { ...message.accountData } : undefined,
  arrivalData: message.arrivalData ? { ...message.arrivalData } : undefined,
  createdAt: message.createdAt instanceof Date ? new Date(message.createdAt) : message.createdAt,
  updatedAt: message.updatedAt instanceof Date ? new Date(message.updatedAt) : message.updatedAt,
});

const displayNameByUserId = (userId: string) => {
  const names: Record<string, string> = {
    'leader-1': '김성결',
    'leader-2': '박지은',
    'leader-3': '강태완',
    'leader-4': '윤서연',
    'current-user': '나',
  };

  return names[userId] ?? `유저-${userId.slice(0, 4)}`;
};

const seedParties = () => {
  if (parties.size > 0) {
    return;
  }

  [
    {
      id: 'taxi-home-party-1',
      leaderId: 'leader-1',
      departure: { name: '안양역', lat: 37.401, lng: 126.923 },
      destination: { name: '성결대학교', lat: 37.380, lng: 126.928 },
      departureTime: '2026-03-20T09:00:00+09:00',
      maxMembers: 4,
      members: ['leader-1', 'member-1', 'member-2'],
      tags: ['안양역', '학교'],
      detail: '정문 앞 하차 예정',
      status: 'open' as const,
    },
    {
      id: 'taxi-home-party-2',
      leaderId: 'leader-2',
      departure: { name: '범계역', lat: 37.390, lng: 126.951 },
      destination: { name: '성결대학교', lat: 37.380, lng: 126.928 },
      departureTime: '2026-03-20T10:30:00+09:00',
      maxMembers: 3,
      members: ['leader-2', 'member-3', 'member-4'],
      tags: ['범계역'],
      detail: '시간 맞는 분만 요청 부탁드립니다.',
      status: 'closed' as const,
    },
    {
      id: 'taxi-home-party-3',
      leaderId: 'leader-3',
      departure: { name: '안양역', lat: 37.401, lng: 126.923 },
      destination: { name: '성결대학교', lat: 37.380, lng: 126.928 },
      departureTime: '2026-03-20T13:00:00+09:00',
      maxMembers: 4,
      members: ['leader-3', 'member-5'],
      tags: ['안양역'],
      detail: '2명 더 모집해요.',
      status: 'open' as const,
    },
  ].forEach((party, index) => {
    parties.set(party.id, {
      ...party,
      createdAt: new Date(Date.now() - index * 1000 * 60 * 30),
      updatedAt: new Date(Date.now() - index * 1000 * 60 * 20),
    });
    partyMessages.set(party.id, [
      {
        id: `${party.id}-message-1`,
        partyId: party.id,
        senderId: 'system',
        senderName: '시스템',
        text: '채팅방이 생성되었어요!',
        type: 'system',
        createdAt: new Date(Date.now() - index * 1000 * 60 * 30),
      },
    ]);
  });
};

seedParties();

const resolveActiveParties = () =>
  Array.from(parties.values())
    .filter(party => party.status !== 'ended')
    .sort(
      (left, right) =>
        toTimestamp(right.createdAt) -
        toTimestamp(left.createdAt),
    )
    .map(cloneParty);

const emitPartyList = () => {
  const activeParties = resolveActiveParties();
  partySubscribers.forEach(callbacks => callbacks.onData(activeParties));
};

const emitPartyDetail = (partyId: string) => {
  const party = parties.get(partyId) ?? null;
  partyDetailSubscribers.get(partyId)?.forEach(callbacks => {
    callbacks.onData(party ? cloneParty(party) : null);
  });

  const affectedUserIds = new Set(party?.members ?? []);
  Array.from(myPartySubscribers.keys()).forEach(userId => {
    if (!party || affectedUserIds.has(userId)) {
      emitMyParty(userId);
    }
  });
};

const emitMyParty = (userId: string) => {
  const party =
    Array.from(parties.values()).find(
      candidate =>
        candidate.status !== 'ended' && candidate.members.includes(userId),
    ) ?? null;

  myPartySubscribers.get(userId)?.forEach(callbacks => {
    callbacks.onData(party ? cloneParty(party) : null);
  });
};

const resolveJoinRequestStatus = (requestId: string): JoinRequestStatus | null => {
  const request = joinRequests.get(requestId);
  if (!request) {
    return null;
  }

  return {
    requestId,
    partyId: request.partyId,
    status: request.status,
  };
};

const emitJoinRequest = (requestId: string) => {
  const status = resolveJoinRequestStatus(requestId);
  joinRequestSubscribers.get(requestId)?.forEach(callbacks => {
    callbacks.onData(status);
  });
};

const emitJoinRequestCount = (leaderId: string) => {
  const count = Array.from(joinRequests.values()).filter(
    request => request.leaderId === leaderId && request.status === 'pending',
  ).length;

  joinRequestCountSubscribers.get(leaderId)?.forEach(callbacks => {
    callbacks.onData(count);
  });
};

const emitPendingJoinRequest = (requesterId: string) => {
  const pendingRequest = Array.from(joinRequests.values()).find(
    request =>
      request.requesterId === requesterId && request.status === 'pending',
  );

  pendingJoinRequestSubscribers.get(requesterId)?.forEach(callbacks => {
    callbacks.onData(
      pendingRequest
        ? {
            requestId: pendingRequest.id,
            partyId: pendingRequest.partyId,
          }
        : null,
    );
  });
};

const emitJoinRequests = (partyId: string) => {
  const requests = Array.from(joinRequests.values())
    .filter(request => request.partyId === partyId && request.status === 'pending')
    .map(cloneJoinRequest);

  joinRequestsSubscribers.get(partyId)?.forEach(callbacks => {
    callbacks.onData(requests);
  });
};

const emitMessages = (partyId: string) => {
  const messages = (partyMessages.get(partyId) ?? []).map(cloneMessage);
  partyMessageSubscribers.get(partyId)?.forEach(callbacks => {
    callbacks.onData(messages);
  });
};

const resolvePartyStatus = (party: Party): Party['status'] =>
  party.members.length >= party.maxMembers ? 'closed' : party.status === 'ended' ? 'ended' : 'open';

export class MockPartyRepository implements IPartyRepository {
  setMockData(mockParties: Party[]): void {
    parties.clear();
    partyMessages.clear();

    mockParties.forEach((party, index) => {
      const partyId = party.id ?? `mock-party-${index + 1}`;
      parties.set(partyId, {
        ...party,
        id: partyId,
        createdAt: party.createdAt ?? nowIso(),
        updatedAt: party.updatedAt ?? nowIso(),
      });
      partyMessages.set(partyId, []);
    });

    emitPartyList();
    mockParties.forEach(party => {
      if (party.id) {
        emitPartyDetail(party.id);
      }
    });
  }

  clearMockData(): void {
    parties.clear();
    joinRequests.clear();
    partyMessages.clear();
    emitPartyList();
  }

  subscribeToParties(
    callbacks: SubscriptionCallbacks<Party[]>,
  ): Unsubscribe {
    partySubscribers.add(callbacks);
    callbacks.onData(resolveActiveParties());

    return () => {
      partySubscribers.delete(callbacks);
    };
  }

  subscribeToParty(
    partyId: string,
    callbacks: SubscriptionCallbacks<Party | null>,
  ): Unsubscribe {
    const bucket = partyDetailSubscribers.get(partyId) ?? new Set();
    bucket.add(callbacks);
    partyDetailSubscribers.set(partyId, bucket);
    callbacks.onData(parties.get(partyId) ? cloneParty(parties.get(partyId)!) : null);

    return () => {
      partyDetailSubscribers.get(partyId)?.delete(callbacks);
    };
  }

  subscribeToMyParty(
    userId: string,
    callbacks: SubscriptionCallbacks<Party | null>,
  ): Unsubscribe {
    const bucket = myPartySubscribers.get(userId) ?? new Set();
    bucket.add(callbacks);
    myPartySubscribers.set(userId, bucket);
    emitMyParty(userId);

    return () => {
      myPartySubscribers.get(userId)?.delete(callbacks);
    };
  }

  async createParty(party: Omit<Party, 'id'>): Promise<string> {
    const id = nextId('mock-party');
    parties.set(id, {
      ...party,
      id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    partyMessages.set(id, []);
    emitPartyList();
    emitPartyDetail(id);
    return id;
  }

  async updateParty(partyId: string, updates: Partial<Party>): Promise<void> {
    const current = parties.get(partyId);
    if (!current) {
      return;
    }

    const nextParty = {
      ...current,
      ...updates,
      updatedAt: nowIso(),
    };

    parties.set(partyId, nextParty);
    emitPartyList();
    emitPartyDetail(partyId);
  }

  async deleteParty(
    partyId: string,
    reason: Party['endReason'],
  ): Promise<void> {
    const current = parties.get(partyId);
    if (!current) {
      return;
    }

    parties.set(partyId, {
      ...current,
      status: 'ended',
      endReason: reason,
      endedAt: nowIso(),
      updatedAt: nowIso(),
    });
    emitPartyList();
    emitPartyDetail(partyId);
  }

  async addMember(partyId: string, userId: string): Promise<void> {
    const current = parties.get(partyId);
    if (!current || current.members.includes(userId)) {
      return;
    }

    const nextParty = {
      ...current,
      members: [...current.members, userId],
      status: resolvePartyStatus({
        ...current,
        members: [...current.members, userId],
      }),
      updatedAt: nowIso(),
    };
    parties.set(partyId, nextParty);
    emitPartyList();
    emitPartyDetail(partyId);
  }

  async removeMember(partyId: string, userId: string): Promise<void> {
    const current = parties.get(partyId);
    if (!current) {
      return;
    }

    const nextMembers = current.members.filter(memberId => memberId !== userId);
    parties.set(partyId, {
      ...current,
      members: nextMembers,
      status: current.status === 'ended'
        ? 'ended'
        : nextMembers.length >= current.maxMembers
          ? 'closed'
          : 'open',
      updatedAt: nowIso(),
    });
    emitPartyList();
    emitPartyDetail(partyId);
  }

  async getParty(partyId: string): Promise<Party | null> {
    const party = parties.get(partyId);
    return party ? cloneParty(party) : null;
  }

  subscribeToJoinRequestCount(
    leaderId: string,
    callbacks: SubscriptionCallbacks<number>,
  ): Unsubscribe {
    const bucket = joinRequestCountSubscribers.get(leaderId) ?? new Set();
    bucket.add(callbacks);
    joinRequestCountSubscribers.set(leaderId, bucket);
    emitJoinRequestCount(leaderId);

    return () => {
      joinRequestCountSubscribers.get(leaderId)?.delete(callbacks);
    };
  }

  subscribeToMyPendingJoinRequest(
    requesterId: string,
    callbacks: SubscriptionCallbacks<PendingJoinRequest | null>,
  ): Unsubscribe {
    const bucket = pendingJoinRequestSubscribers.get(requesterId) ?? new Set();
    bucket.add(callbacks);
    pendingJoinRequestSubscribers.set(requesterId, bucket);
    emitPendingJoinRequest(requesterId);

    return () => {
      pendingJoinRequestSubscribers.get(requesterId)?.delete(callbacks);
    };
  }

  subscribeToJoinRequest(
    requestId: string,
    callbacks: SubscriptionCallbacks<JoinRequestStatus | null>,
  ): Unsubscribe {
    const bucket = joinRequestSubscribers.get(requestId) ?? new Set();
    bucket.add(callbacks);
    joinRequestSubscribers.set(requestId, bucket);
    emitJoinRequest(requestId);

    return () => {
      joinRequestSubscribers.get(requestId)?.delete(callbacks);
    };
  }

  async cancelJoinRequest(requestId: string): Promise<void> {
    const request = joinRequests.get(requestId);
    if (!request) {
      return;
    }

    joinRequests.set(requestId, {
      ...request,
      status: 'canceled',
    });
    emitJoinRequest(requestId);
    emitJoinRequestCount(request.leaderId);
    emitPendingJoinRequest(request.requesterId);
    emitJoinRequests(request.partyId);
  }

  async createJoinRequest(
    partyId: string,
    leaderId: string,
    requesterId: string,
  ): Promise<string> {
    const id = nextId('mock-join-request');
    joinRequests.set(id, {
      id,
      partyId,
      requesterId,
      leaderId,
      status: 'pending',
      createdAt: nowIso(),
    });

    emitJoinRequest(id);
    emitJoinRequestCount(leaderId);
    emitPendingJoinRequest(requesterId);
    emitJoinRequests(partyId);
    return id;
  }

  subscribeToPartyMessages(
    partyId: string,
    callbacks: SubscriptionCallbacks<PartyMessage[]>,
  ): Unsubscribe {
    const bucket = partyMessageSubscribers.get(partyId) ?? new Set();
    bucket.add(callbacks);
    partyMessageSubscribers.set(partyId, bucket);
    emitMessages(partyId);

    return () => {
      partyMessageSubscribers.get(partyId)?.delete(callbacks);
    };
  }

  async sendPartyMessage(partyId: string, senderId: string, text: string): Promise<void> {
    const nextMessage: PartyMessage = {
      id: nextId('mock-party-message'),
      partyId,
      senderId,
      senderName: displayNameByUserId(senderId),
      text,
      type: 'user',
      createdAt: nowIso(),
    };
    partyMessages.set(partyId, [...(partyMessages.get(partyId) ?? []), nextMessage]);
    emitMessages(partyId);
  }

  async sendSystemMessage(partyId: string, text: string): Promise<void> {
    partyMessages.set(partyId, [
      ...(partyMessages.get(partyId) ?? []),
      {
        id: nextId('mock-party-system-message'),
        partyId,
        senderId: 'system',
        senderName: '시스템',
        text,
        type: 'system',
        createdAt: nowIso(),
      },
    ]);
    emitMessages(partyId);
  }

  async sendAccountMessage(
    partyId: string,
    senderId: string,
    accountData: AccountMessageData,
  ): Promise<void> {
    partyMessages.set(partyId, [
      ...(partyMessages.get(partyId) ?? []),
      {
        id: nextId('mock-party-account-message'),
        partyId,
        senderId,
        senderName: displayNameByUserId(senderId),
        text: '계좌 정보를 공유했어요.',
        type: 'account',
        accountData,
        createdAt: nowIso(),
      },
    ]);
    emitMessages(partyId);
  }

  async sendArrivedMessage(
    partyId: string,
    senderId: string,
    arrivalData: ArrivalMessageData,
  ): Promise<void> {
    partyMessages.set(partyId, [
      ...(partyMessages.get(partyId) ?? []),
      {
        id: nextId('mock-party-arrived-message'),
        partyId,
        senderId,
        senderName: displayNameByUserId(senderId),
        text: '도착 및 정산 정보를 공유했어요.',
        type: 'arrived',
        arrivalData,
        createdAt: nowIso(),
      },
    ]);
    emitMessages(partyId);
  }

  async sendEndMessage(
    partyId: string,
    senderId: string,
    partyArrived: boolean,
  ): Promise<void> {
    partyMessages.set(partyId, [
      ...(partyMessages.get(partyId) ?? []),
      {
        id: nextId('mock-party-end-message'),
        partyId,
        senderId,
        senderName: displayNameByUserId(senderId),
        text: partyArrived ? '파티가 종료되었어요.' : '파티가 취소되었어요.',
        type: 'end',
        createdAt: nowIso(),
      },
    ]);
    emitMessages(partyId);
  }

  subscribeToJoinRequests(
    partyId: string,
    callbacks: SubscriptionCallbacks<JoinRequest[]>,
  ): Unsubscribe {
    const bucket = joinRequestsSubscribers.get(partyId) ?? new Set();
    bucket.add(callbacks);
    joinRequestsSubscribers.set(partyId, bucket);
    emitJoinRequests(partyId);

    return () => {
      joinRequestsSubscribers.get(partyId)?.delete(callbacks);
    };
  }

  async acceptJoinRequest(
    requestId: string,
    partyId: string,
    requesterId: string,
  ): Promise<void> {
    const request = joinRequests.get(requestId);
    if (!request) {
      return;
    }

    joinRequests.set(requestId, {
      ...request,
      status: 'accepted',
    });
    await this.addMember(partyId, requesterId);
    emitJoinRequest(requestId);
    emitJoinRequestCount(request.leaderId);
    emitPendingJoinRequest(requesterId);
    emitJoinRequests(partyId);
  }

  async declineJoinRequest(requestId: string): Promise<void> {
    const request = joinRequests.get(requestId);
    if (!request) {
      return;
    }

    joinRequests.set(requestId, {
      ...request,
      status: 'declined',
    });
    emitJoinRequest(requestId);
    emitJoinRequestCount(request.leaderId);
    emitPendingJoinRequest(request.requesterId);
    emitJoinRequests(request.partyId);
  }

  async getPartyChatMuted(partyId: string, userId: string): Promise<boolean> {
    return partyChatMuted.get(`${partyId}:${userId}`) ?? false;
  }

  async setPartyChatMuted(
    partyId: string,
    userId: string,
    muted: boolean,
  ): Promise<void> {
    partyChatMuted.set(`${partyId}:${userId}`, muted);
  }

  async startSettlement(partyId: string, settlementData: SettlementData): Promise<void> {
    const party = parties.get(partyId);
    if (!party) {
      return;
    }

    parties.set(partyId, {
      ...party,
      status: 'arrived',
      settlement: {
        status: 'pending',
        perPersonAmount: settlementData.perPersonAmount,
        members: { ...settlementData.members },
      },
      updatedAt: nowIso(),
    });
    emitPartyList();
    emitPartyDetail(partyId);
  }

  async markMemberSettled(partyId: string, memberId: string): Promise<void> {
    const party = parties.get(partyId);
    if (!party?.settlement) {
      return;
    }

    parties.set(partyId, {
      ...party,
      settlement: {
        ...party.settlement,
        members: {
          ...party.settlement.members,
          [memberId]: {
            settled: true,
            settledAt: nowIso(),
          },
        },
      },
      updatedAt: nowIso(),
    });
    emitPartyDetail(partyId);
  }

  async completeSettlement(partyId: string): Promise<void> {
    const party = parties.get(partyId);
    if (!party) {
      return;
    }

    parties.set(partyId, {
      ...party,
      status: 'ended',
      endReason: 'arrived',
      endedAt: nowIso(),
      settlement: party.settlement
        ? {
            ...party.settlement,
            status: 'completed',
          }
        : party.settlement,
      updatedAt: nowIso(),
    });
    emitPartyList();
    emitPartyDetail(partyId);
  }
}
