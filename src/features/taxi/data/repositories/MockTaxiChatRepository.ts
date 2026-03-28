import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

import type {TaxiRecruitDraft} from '../../model/taxiRecruitData';
import {
  TAXI_CHAT_CURRENT_USER_ID,
  TAXI_CHAT_CURRENT_USER_NAME,
  type TaxiChatAccountMessageDraft,
  type TaxiChatImageUploadInput,
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
  departureLocation: {
    lat: 37.38965,
    lng: 126.9325,
    name: departureLabel,
  },
  departureTimeISO: departureAtISO,
  destinationLocation: {
    lat: 37.3868,
    lng: 126.9348,
    name: destinationLabel,
  },
  id: partyId,
  leaderId: TAXI_CHAT_CURRENT_USER_ID,
  maxMembers,
  memberCount: 1,
  notificationEnabled: true,
  participants: [
    {
      id: TAXI_CHAT_CURRENT_USER_ID,
      isLeader: true,
      name: TAXI_CHAT_CURRENT_USER_NAME,
      settled: false,
    },
  ],
  partyStatus: 'open',
  tagLabel: tags[0] ?? '#빠른출발',
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
  departureLocation: {...party.departureLocation},
  destinationLocation: {...party.destinationLocation},
  latestAccountData: party.latestAccountData
    ? {...party.latestAccountData}
    : undefined,
  messages: party.messages.map(message => ({
    ...message,
    accountData: message.accountData ? {...message.accountData} : undefined,
    arrivalData: message.arrivalData ? {...message.arrivalData} : undefined,
    avatar: message.avatar ? {...message.avatar} : undefined,
  })),
  participants: party.participants.map(participant => ({...participant})),
  settlement: party.settlement ? {...party.settlement} : undefined,
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

  private appendMessage(
    partyId: string,
    message: TaxiChatSourceData['messages'][number],
  ) {
    const party = this.ensureParty(partyId);
    party.messages.push(message);
    emitPartyChange(partyId);
    return clonePartySource(party);
  }

  async createPartyChat(draft: TaxiRecruitDraft): Promise<{partyId: string}> {
    await wait();

    const partyId = `mock-party-${Date.now()}`;

    taxiChatStore.partiesById[partyId] = createPartySource({
      departureAtISO: draft.departureAtISO,
      departureLabel: draft.departure.name,
      destinationLabel: draft.destination.name,
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

    return this.appendMessage(partyId, {
      createdAt: new Date().toISOString(),
      id: `${partyId}-message-${Date.now()}`,
      senderId: TAXI_CHAT_CURRENT_USER_ID,
      senderName: TAXI_CHAT_CURRENT_USER_NAME,
      text: messageText,
      type: 'text',
    });
  }

  async sendImageMessage(
    partyId: string,
    imageUrl: string,
  ): Promise<TaxiChatSourceData | null> {
    await wait();

    return this.appendMessage(partyId, {
      createdAt: new Date().toISOString(),
      id: `${partyId}-image-${Date.now()}`,
      imageUrl,
      senderId: TAXI_CHAT_CURRENT_USER_ID,
      senderName: TAXI_CHAT_CURRENT_USER_NAME,
      text: imageUrl,
      type: 'image',
    });
  }

  async sendAccountMessage(
    partyId: string,
    payload: TaxiChatAccountMessageDraft,
  ): Promise<TaxiChatSourceData | null> {
    await wait();

    const party = this.ensureParty(partyId);
    const accountData = {
      accountHolder: payload.hideName
        ? `${payload.accountHolder.slice(0, 1)}*${payload.accountHolder.slice(-1)}`
        : payload.accountHolder,
      accountNumber: payload.accountNumber,
      bankName: payload.bankName,
      hideName: payload.hideName,
    };

    party.latestAccountData = accountData;

    return this.appendMessage(partyId, {
      accountData,
      createdAt: new Date().toISOString(),
      id: `${partyId}-account-${Date.now()}`,
      senderId: TAXI_CHAT_CURRENT_USER_ID,
      senderName: TAXI_CHAT_CURRENT_USER_NAME,
      text: `${accountData.bankName} ${accountData.accountNumber}`,
      type: 'account',
    });
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

  async uploadImage({uri}: TaxiChatImageUploadInput): Promise<string> {
    await wait();
    return uri;
  }
}
