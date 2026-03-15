import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

import type {
  AccountMessageData,
  ArrivalMessageData,
  IPartyRepository,
} from '../data/repositories/IPartyRepository';
import type {
  JoinRequestStatus,
  Party,
  PartyMessage,
  PendingJoinRequest,
} from '../model/types';

export class MockPartyRepository implements IPartyRepository {
  private parties = new Map<string, Party>();

  private subscribers = new Set<SubscriptionCallbacks<Party[]>>();

  private partySubscribers = new Map<
    string,
    Set<SubscriptionCallbacks<Party | null>>
  >();

  private userPartySubscribers = new Map<
    string,
    Set<SubscriptionCallbacks<Party | null>>
  >();

  private nextId = 1;

  setMockData(parties: Party[]): void {
    this.parties.clear();
    parties.forEach((party) => {
      this.parties.set(party.id || `party-${this.nextId++}`, party);
    });
    this.notifyPartyListSubscribers();
  }

  clearMockData(): void {
    this.parties.clear();
    this.notifyPartyListSubscribers();
  }

  subscribeToParties(
    callbacks: SubscriptionCallbacks<Party[]>,
  ): Unsubscribe {
    this.subscribers.add(callbacks);

    const activeParties = Array.from(this.parties.values()).filter(
      (party) => party.status !== 'ended',
    );
    callbacks.onData(activeParties);

    return () => {
      this.subscribers.delete(callbacks);
    };
  }

  subscribeToParty(
    partyId: string,
    callbacks: SubscriptionCallbacks<Party | null>,
  ): Unsubscribe {
    if (!this.partySubscribers.has(partyId)) {
      this.partySubscribers.set(partyId, new Set());
    }
    this.partySubscribers.get(partyId)?.add(callbacks);

    callbacks.onData(this.parties.get(partyId) || null);

    return () => {
      this.partySubscribers.get(partyId)?.delete(callbacks);
    };
  }

  subscribeToMyParty(
    userId: string,
    callbacks: SubscriptionCallbacks<Party | null>,
  ): Unsubscribe {
    if (!this.userPartySubscribers.has(userId)) {
      this.userPartySubscribers.set(userId, new Set());
    }
    this.userPartySubscribers.get(userId)?.add(callbacks);

    callbacks.onData(this.findUserParty(userId));

    return () => {
      this.userPartySubscribers.get(userId)?.delete(callbacks);
    };
  }

  async createParty(party: Omit<Party, 'id'>): Promise<string> {
    const id = `party-${this.nextId++}`;
    const newParty: Party = {
      ...party,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.parties.set(id, newParty);
    this.notifyPartyListSubscribers();
    return id;
  }

  async updateParty(partyId: string, updates: Partial<Party>): Promise<void> {
    const party = this.parties.get(partyId);
    if (!party) {
      return;
    }

    const updatedParty: Party = {
      ...party,
      ...updates,
      updatedAt: new Date(),
    };
    this.parties.set(partyId, updatedParty);
    this.notifyPartyListSubscribers();
    this.notifyPartySubscribers(partyId);
  }

  async deleteParty(
    partyId: string,
    reason: Party['endReason'],
  ): Promise<void> {
    const party = this.parties.get(partyId);
    if (!party) {
      return;
    }

    const updatedParty: Party = {
      ...party,
      status: 'ended',
      endReason: reason,
      endedAt: new Date(),
      updatedAt: new Date(),
    };
    this.parties.set(partyId, updatedParty);
    this.notifyPartyListSubscribers();
    this.notifyPartySubscribers(partyId);
  }

  async addMember(partyId: string, userId: string): Promise<void> {
    const party = this.parties.get(partyId);
    if (!party || party.members.includes(userId)) {
      return;
    }

    const updatedParty: Party = {
      ...party,
      members: [...party.members, userId],
      updatedAt: new Date(),
    };
    this.parties.set(partyId, updatedParty);
    this.notifyPartyListSubscribers();
    this.notifyPartySubscribers(partyId);
    this.notifyUserPartySubscribers(userId);
  }

  async removeMember(partyId: string, userId: string): Promise<void> {
    const party = this.parties.get(partyId);
    if (!party) {
      return;
    }

    const updatedParty: Party = {
      ...party,
      members: party.members.filter((id) => id !== userId),
      updatedAt: new Date(),
    };
    this.parties.set(partyId, updatedParty);
    this.notifyPartyListSubscribers();
    this.notifyPartySubscribers(partyId);
    this.notifyUserPartySubscribers(userId);
  }

  async getParty(partyId: string): Promise<Party | null> {
    return this.parties.get(partyId) || null;
  }

  subscribeToJoinRequestCount(
    _leaderId: string,
    callbacks: SubscriptionCallbacks<number>,
  ): Unsubscribe {
    callbacks.onData(0);
    return () => {};
  }

  subscribeToMyPendingJoinRequest(
    _requesterId: string,
    callbacks: SubscriptionCallbacks<PendingJoinRequest | null>,
  ): Unsubscribe {
    callbacks.onData(null);
    return () => {};
  }

  subscribeToJoinRequest(
    _requestId: string,
    callbacks: SubscriptionCallbacks<JoinRequestStatus | null>,
  ): Unsubscribe {
    callbacks.onData(null);
    return () => {};
  }

  async cancelJoinRequest(_requestId: string): Promise<void> {}

  async createJoinRequest(
    _partyId: string,
    _leaderId: string,
    _requesterId: string,
  ): Promise<string> {
    return `mock-join-request-${Date.now()}`;
  }

  subscribeToPartyMessages(
    _partyId: string,
    callbacks: SubscriptionCallbacks<PartyMessage[]>,
  ): Unsubscribe {
    callbacks.onData([]);
    return () => {};
  }

  async sendMessage(_partyId: string, _text: string, _senderId: string): Promise<void> {}

  async sendSystemMessage(_partyId: string, _text: string): Promise<void> {}

  async sendAccountMessage(
    _partyId: string,
    _senderId: string,
    _senderName: string,
    _accountData: AccountMessageData,
  ): Promise<void> {}

  async sendArrivedMessage(
    _partyId: string,
    _senderId: string,
    _senderName: string,
    _arrivalData: ArrivalMessageData,
  ): Promise<void> {}

  async sendEndMessage(_partyId: string): Promise<void> {}

  async createSettlementData(_partyId: string): Promise<void> {}

  async updateSettlementStatus(
    _partyId: string,
    _userId: string,
    _status: 'pending' | 'completed',
  ): Promise<void> {}

  private findUserParty(userId: string): Party | null {
    return (
      Array.from(this.parties.values()).find(
        (party) => party.members.includes(userId) && party.status !== 'ended',
      ) || null
    );
  }

  private notifyPartyListSubscribers(): void {
    const activeParties = Array.from(this.parties.values()).filter(
      (party) => party.status !== 'ended',
    );

    this.subscribers.forEach((callbacks) => {
      callbacks.onData(activeParties);
    });
  }

  private notifyPartySubscribers(partyId: string): void {
    const callbacks = this.partySubscribers.get(partyId);
    if (!callbacks) {
      return;
    }

    const party = this.parties.get(partyId) || null;
    callbacks.forEach((callback) => {
      callback.onData(party);
    });
  }

  private notifyUserPartySubscribers(userId: string): void {
    const callbacks = this.userPartySubscribers.get(userId);
    if (!callbacks) {
      return;
    }

    const party = this.findUserParty(userId);
    callbacks.forEach((callback) => {
      callback.onData(party);
    });
  }
}
