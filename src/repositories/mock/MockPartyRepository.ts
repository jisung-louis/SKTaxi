// SKTaxi: Party Repository Mock 구현체
// 테스트용 인메모리 구현

import { Party } from '../../types/party';
import {
  IPartyRepository,
  Unsubscribe,
  SubscriptionCallbacks,
  PendingJoinRequest,
  JoinRequestStatus,
  PartyMessage,
  AccountMessageData,
  ArrivalMessageData,
} from '../interfaces/IPartyRepository';

/**
 * Mock Party Repository - 테스트용 인메모리 구현
 */
export class MockPartyRepository implements IPartyRepository {
  private parties: Map<string, Party> = new Map();
  private subscribers: Set<SubscriptionCallbacks<Party[]>> = new Set();
  private partySubscribers: Map<string, Set<SubscriptionCallbacks<Party | null>>> = new Map();
  private userPartySubscribers: Map<string, Set<SubscriptionCallbacks<Party | null>>> = new Map();
  private nextId: number = 1;

  /**
   * 테스트용 데이터 설정
   */
  setMockData(parties: Party[]): void {
    this.parties.clear();
    parties.forEach((party) => {
      this.parties.set(party.id || `party-${this.nextId++}`, party);
    });
    this.notifyAllSubscribers();
  }

  /**
   * 테스트용 데이터 초기화
   */
  clearMockData(): void {
    this.parties.clear();
    this.notifyAllSubscribers();
  }

  subscribeToParties(callbacks: SubscriptionCallbacks<Party[]>): Unsubscribe {
    this.subscribers.add(callbacks);

    // 즉시 현재 데이터 전달
    const activeParties = Array.from(this.parties.values()).filter(
      (p) => p.status !== 'ended'
    );
    callbacks.onData(activeParties);

    return () => {
      this.subscribers.delete(callbacks);
    };
  }

  subscribeToParty(
    partyId: string,
    callbacks: SubscriptionCallbacks<Party | null>
  ): Unsubscribe {
    if (!this.partySubscribers.has(partyId)) {
      this.partySubscribers.set(partyId, new Set());
    }
    this.partySubscribers.get(partyId)!.add(callbacks);

    // 즉시 현재 데이터 전달
    const party = this.parties.get(partyId) || null;
    callbacks.onData(party);

    return () => {
      this.partySubscribers.get(partyId)?.delete(callbacks);
    };
  }

  subscribeToMyParty(
    userId: string,
    callbacks: SubscriptionCallbacks<Party | null>
  ): Unsubscribe {
    if (!this.userPartySubscribers.has(userId)) {
      this.userPartySubscribers.set(userId, new Set());
    }
    this.userPartySubscribers.get(userId)!.add(callbacks);

    // 즉시 현재 데이터 전달
    const myParty = this.findUserParty(userId);
    callbacks.onData(myParty);

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
    this.notifyAllSubscribers();
    return id;
  }

  async updateParty(partyId: string, updates: Partial<Party>): Promise<void> {
    const party = this.parties.get(partyId);
    if (party) {
      const updatedParty: Party = {
        ...party,
        ...updates,
        updatedAt: new Date(),
      };
      this.parties.set(partyId, updatedParty);
      this.notifyAllSubscribers();
      this.notifyPartySubscribers(partyId);
    }
  }

  async deleteParty(partyId: string, reason: Party['endReason']): Promise<void> {
    const party = this.parties.get(partyId);
    if (party) {
      const updatedParty: Party = {
        ...party,
        status: 'ended',
        endReason: reason,
        endedAt: new Date(),
        updatedAt: new Date(),
      };
      this.parties.set(partyId, updatedParty);
      this.notifyAllSubscribers();
      this.notifyPartySubscribers(partyId);
    }
  }

  async addMember(partyId: string, userId: string): Promise<void> {
    const party = this.parties.get(partyId);
    if (party && !party.members.includes(userId)) {
      const updatedParty: Party = {
        ...party,
        members: [...party.members, userId],
        updatedAt: new Date(),
      };
      this.parties.set(partyId, updatedParty);
      this.notifyAllSubscribers();
      this.notifyPartySubscribers(partyId);
      this.notifyUserPartySubscribers(userId);
    }
  }

  async removeMember(partyId: string, userId: string): Promise<void> {
    const party = this.parties.get(partyId);
    if (party) {
      const updatedParty: Party = {
        ...party,
        members: party.members.filter((id) => id !== userId),
        updatedAt: new Date(),
      };
      this.parties.set(partyId, updatedParty);
      this.notifyAllSubscribers();
      this.notifyPartySubscribers(partyId);
      this.notifyUserPartySubscribers(userId);
    }
  }

  async getParty(partyId: string): Promise<Party | null> {
    return this.parties.get(partyId) || null;
  }

  subscribeToJoinRequestCount(
    leaderId: string,
    callbacks: SubscriptionCallbacks<number>
  ): Unsubscribe {
    // Mock 구현: 항상 0 반환
    callbacks.onData(0);
    return () => {};
  }

  subscribeToMyPendingJoinRequest(
    requesterId: string,
    callbacks: SubscriptionCallbacks<PendingJoinRequest | null>
  ): Unsubscribe {
    // Mock 구현: 항상 null 반환 (대기 중인 요청 없음)
    callbacks.onData(null);
    return () => {};
  }

  subscribeToJoinRequest(
    requestId: string,
    callbacks: SubscriptionCallbacks<JoinRequestStatus | null>
  ): Unsubscribe {
    // Mock 구현: 항상 null 반환
    callbacks.onData(null);
    return () => {};
  }

  async cancelJoinRequest(requestId: string): Promise<void> {
    // Mock 구현: 아무 작업 없음
  }

  async createJoinRequest(
    partyId: string,
    leaderId: string,
    requesterId: string
  ): Promise<string> {
    // Mock 구현: 임의의 요청 ID 반환
    return `mock-join-request-${Date.now()}`;
  }

  // === 파티 채팅 메시지 관련 (Mock 구현) ===

  subscribeToPartyMessages(
    partyId: string,
    callbacks: SubscriptionCallbacks<PartyMessage[]>
  ): Unsubscribe {
    // Mock 구현: 빈 배열 반환
    callbacks.onData([]);
    return () => {};
  }

  async sendPartyMessage(
    partyId: string,
    senderId: string,
    text: string
  ): Promise<void> {
    // Mock 구현: 아무 작업 없음
  }

  async sendSystemMessage(partyId: string, text: string): Promise<void> {
    // Mock 구현: 아무 작업 없음
  }

  async sendAccountMessage(
    partyId: string,
    senderId: string,
    accountData: AccountMessageData
  ): Promise<void> {
    // Mock 구현: 아무 작업 없음
  }

  async sendArrivedMessage(
    partyId: string,
    senderId: string,
    arrivalData: ArrivalMessageData
  ): Promise<void> {
    // Mock 구현: 아무 작업 없음
  }

  async sendEndMessage(
    partyId: string,
    senderId: string,
    partyArrived: boolean
  ): Promise<void> {
    // Mock 구현: 아무 작업 없음
  }

  // Private 헬퍼 메서드

  private findUserParty(userId: string): Party | null {
    return (
      Array.from(this.parties.values()).find(
        (p) => p.members.includes(userId) && p.status !== 'ended'
      ) || null
    );
  }

  private notifyAllSubscribers(): void {
    const activeParties = Array.from(this.parties.values()).filter(
      (p) => p.status !== 'ended'
    );
    this.subscribers.forEach((callback) => {
      callback.onData(activeParties);
    });

    // 각 사용자의 구독자에게도 알림
    this.userPartySubscribers.forEach((subs, userId) => {
      const myParty = this.findUserParty(userId);
      subs.forEach((callback) => callback.onData(myParty));
    });
  }

  private notifyPartySubscribers(partyId: string): void {
    const party = this.parties.get(partyId) || null;
    this.partySubscribers.get(partyId)?.forEach((callback) => {
      callback.onData(party);
    });
  }

  private notifyUserPartySubscribers(userId: string): void {
    const myParty = this.findUserParty(userId);
    this.userPartySubscribers.get(userId)?.forEach((callback) => {
      callback.onData(myParty);
    });
  }
}
