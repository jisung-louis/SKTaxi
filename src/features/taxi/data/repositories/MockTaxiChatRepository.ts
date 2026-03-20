import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

import type {TaxiRecruitDraft} from '../../model/taxiRecruitData';
import {
  TAXI_CHAT_CURRENT_USER_ID,
  TAXI_CHAT_CURRENT_USER_NAME,
  type TaxiChatSessionSnapshot,
  type TaxiChatSourceData,
} from '../../model/taxiChatViewData';
import type {ITaxiChatRepository} from './ITaxiChatRepository';

const NETWORK_DELAY_MS = 180;

const wait = async () => {
  await new Promise(resolve => {
    setTimeout(resolve, NETWORK_DELAY_MS);
  });
};

const formatPartyTitle = (departureLabel: string, destinationLabel: string) =>
  `${departureLabel} → ${destinationLabel} 파티`;

const formatDepartureTimeLabel = (departureAtISO: string) =>
  format(new Date(departureAtISO), 'M월 d일 a hh:mm', {locale: ko});

const createPartySource = ({
  departureLabel,
  destinationLabel,
  departureAtISO,
  maxMembers,
  partyId,
  tags,
}: {
  departureAtISO: string
  departureLabel: string
  destinationLabel: string
  maxMembers: number
  partyId: string
  tags: string[]
}): TaxiChatSourceData => ({
  composerPlaceholder: '메시지를 입력하세요',
  id: partyId,
  maxMembers,
  memberCount: 1,
  notificationEnabled: true,
  summary: {
    departureLabel,
    departureTimeLabel: formatDepartureTimeLabel(departureAtISO),
    destinationLabel,
    memberSummaryLabel: `1/${maxMembers}명`,
    tagLabel: tags[0] ?? '#빠른출발',
  },
  title: formatPartyTitle(departureLabel, destinationLabel),
  messages: [],
});

const createFallbackPartySource = (partyId: string): TaxiChatSourceData =>
  createPartySource({
    departureAtISO: '2026-03-13T21:35:00+09:00',
    departureLabel: '금정역',
    destinationLabel: '성결대학교',
    maxMembers: 6,
    partyId,
    tags: ['#빠른출발'],
  });

const clonePartySource = (party: TaxiChatSourceData): TaxiChatSourceData => ({
  ...party,
  messages: party.messages.map(message => ({
    ...message,
    avatar: message.avatar ? {...message.avatar} : undefined,
  })),
  summary: {...party.summary},
});

type TaxiChatStore = {
  currentPartyId: string | null
  partiesById: Record<string, TaxiChatSourceData>
}

const taxiChatStore: TaxiChatStore = {
  currentPartyId: null,
  partiesById: {},
};

const listeners = new Set<() => void>();
const partyListeners = new Map<
  string,
  Set<SubscriptionCallbacks<TaxiChatSourceData | null>>
>();

const emitChange = () => {
  listeners.forEach(listener => {
    listener();
  });
};

const emitPartyChange = (partyId: string) => {
  const subscribers = partyListeners.get(partyId);

  if (!subscribers || subscribers.size === 0) {
    return;
  }

  const party = taxiChatStore.partiesById[partyId];

  subscribers.forEach(callbacks => {
    callbacks.onData(party ? clonePartySource(party) : null);
  });
};

export class MockTaxiChatRepository implements ITaxiChatRepository {
  private ensureParty(partyId: string) {
    if (!taxiChatStore.partiesById[partyId]) {
      taxiChatStore.partiesById[partyId] = createFallbackPartySource(partyId);
    }

    return taxiChatStore.partiesById[partyId];
  }

  async createPartyChat(draft: TaxiRecruitDraft): Promise<{partyId: string}> {
    await wait();

    const partyId = `mock-party-${Date.now()}`;

    taxiChatStore.partiesById[partyId] = createPartySource({
      departureAtISO: draft.departureAtISO,
      departureLabel: draft.departure.label,
      destinationLabel: draft.destination.label,
      maxMembers: draft.maxMembers,
      partyId,
      tags: draft.tags,
    });
    taxiChatStore.currentPartyId = partyId;
    emitChange();
    emitPartyChange(partyId);

    return {partyId};
  }

  async getPartyChat(partyId: string): Promise<TaxiChatSourceData | null> {
    await wait();
    return clonePartySource(this.ensureParty(partyId));
  }

  getSessionSnapshot(): TaxiChatSessionSnapshot {
    return {
      currentPartyId: taxiChatStore.currentPartyId,
    };
  }

  async leaveParty(partyId: string): Promise<void> {
    await wait();

    if (taxiChatStore.currentPartyId === partyId) {
      taxiChatStore.currentPartyId = null;
      emitChange();
    }
  }

  async resetSession(): Promise<void> {
    await wait();

    taxiChatStore.currentPartyId = null;
    taxiChatStore.partiesById = {};
    partyListeners.clear();
    emitChange();
  }

  async sendMessage(
    partyId: string,
    messageText: string,
  ): Promise<TaxiChatSourceData | null> {
    await wait();

    const party = this.ensureParty(partyId);
    party.messages.push({
      createdAt: new Date().toISOString(),
      id: `${partyId}-message-${Date.now()}`,
      senderId: TAXI_CHAT_CURRENT_USER_ID,
      senderName: TAXI_CHAT_CURRENT_USER_NAME,
      text: messageText,
    });
    emitPartyChange(partyId);

    return clonePartySource(party);
  }

  async setCurrentParty(partyId: string): Promise<void> {
    await wait();
    this.ensureParty(partyId);
    taxiChatStore.currentPartyId = partyId;
    emitChange();
  }

  subscribeToSession(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  subscribeToPartyChat(
    partyId: string,
    callbacks: SubscriptionCallbacks<TaxiChatSourceData | null>,
  ): Unsubscribe {
    const bucket = partyListeners.get(partyId) ?? new Set();
    bucket.add(callbacks);
    partyListeners.set(partyId, bucket);
    callbacks.onData(clonePartySource(this.ensureParty(partyId)));

    return () => {
      const currentBucket = partyListeners.get(partyId);

      if (!currentBucket) {
        return;
      }

      currentBucket.delete(callbacks);

      if (currentBucket.size === 0) {
        partyListeners.delete(partyId);
      }
    };
  }

  async updateNotificationSetting(
    partyId: string,
    enabled: boolean,
  ): Promise<TaxiChatSourceData | null> {
    await wait();

    const party = this.ensureParty(partyId);
    party.notificationEnabled = enabled;
    emitPartyChange(partyId);
    return clonePartySource(party);
  }
}
