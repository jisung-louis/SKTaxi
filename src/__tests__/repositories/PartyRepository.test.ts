// SKTaxi: PartyRepository 단위 테스트
// Mock Repository를 사용하여 Repository 인터페이스 계약 검증

import { MockPartyRepository } from '../../repositories/mock/MockPartyRepository';
import { Party } from '../../types/party';
import {
  createMockParty,
  createMockSubscriptionCallbacks,
} from '../__mocks__/firebase';

describe('MockPartyRepository', () => {
  let repository: MockPartyRepository;

  beforeEach(() => {
    repository = new MockPartyRepository();
  });

  afterEach(() => {
    repository.clearMockData();
  });

  describe('subscribeToParties', () => {
    it('should return empty array when no parties exist', () => {
      const callbacks = createMockSubscriptionCallbacks<Party[]>();
      const unsubscribe = repository.subscribeToParties(callbacks);

      expect(callbacks.onData).toHaveBeenCalledWith([]);
      unsubscribe();
    });

    it('should return active parties only (filter out ended)', () => {
      const activeParty = createMockParty({ id: 'party-1', status: 'open' });
      const endedParty = createMockParty({ id: 'party-2', status: 'ended' });
      repository.setMockData([activeParty, endedParty]);

      const callbacks = createMockSubscriptionCallbacks<Party[]>();
      const unsubscribe = repository.subscribeToParties(callbacks);

      expect(callbacks.onData).toHaveBeenCalledWith([activeParty]);
      unsubscribe();
    });

    it('should notify subscribers when data changes', async () => {
      const callbacks = createMockSubscriptionCallbacks<Party[]>();
      const unsubscribe = repository.subscribeToParties(callbacks);

      // 초기 빈 데이터
      expect(callbacks.onData).toHaveBeenCalledWith([]);

      // 새 파티 추가
      const newPartyId = await repository.createParty({
        leaderId: 'user-1',
        departure: { name: '성결대학교', lat: 37.4, lng: 127.0 },
        destination: { name: '강남역', lat: 37.5, lng: 127.0 },
        departureTime: new Date().toISOString(),
        maxMembers: 4,
        members: ['user-1'],
        status: 'open',
      });

      // 구독자에게 알림이 갔는지 확인
      expect(callbacks.onData).toHaveBeenCalledTimes(2);
      const lastCallData = callbacks.onData.mock.calls[1][0];
      expect(lastCallData).toHaveLength(1);
      expect(lastCallData[0].id).toBe(newPartyId);

      unsubscribe();
    });

    it('should stop receiving updates after unsubscribe', async () => {
      const callbacks = createMockSubscriptionCallbacks<Party[]>();
      const unsubscribe = repository.subscribeToParties(callbacks);

      unsubscribe();

      // 구독 해제 후 파티 추가
      await repository.createParty({
        leaderId: 'user-1',
        departure: { name: '성결대학교', lat: 37.4, lng: 127.0 },
        destination: { name: '강남역', lat: 37.5, lng: 127.0 },
        departureTime: new Date().toISOString(),
        maxMembers: 4,
        members: ['user-1'],
        status: 'open',
      });

      // 최초 1회만 호출되어야 함
      expect(callbacks.onData).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeToParty', () => {
    it('should return null for non-existent party', () => {
      const callbacks = createMockSubscriptionCallbacks<Party | null>();
      const unsubscribe = repository.subscribeToParty('non-existent', callbacks);

      expect(callbacks.onData).toHaveBeenCalledWith(null);
      unsubscribe();
    });

    it('should return party data for existing party', () => {
      const party = createMockParty({ id: 'party-1' });
      repository.setMockData([party]);

      const callbacks = createMockSubscriptionCallbacks<Party | null>();
      const unsubscribe = repository.subscribeToParty('party-1', callbacks);

      expect(callbacks.onData).toHaveBeenCalledWith(party);
      unsubscribe();
    });

    it('should notify when party is updated', async () => {
      const party = createMockParty({ id: 'party-1', status: 'open' });
      repository.setMockData([party]);

      const callbacks = createMockSubscriptionCallbacks<Party | null>();
      const unsubscribe = repository.subscribeToParty('party-1', callbacks);

      // 파티 업데이트
      await repository.updateParty('party-1', { status: 'closed' });

      expect(callbacks.onData).toHaveBeenCalledTimes(2);
      const lastCallData = callbacks.onData.mock.calls[1][0];
      expect(lastCallData?.status).toBe('closed');

      unsubscribe();
    });
  });

  describe('subscribeToMyParty', () => {
    it('should return null when user has no party', () => {
      const callbacks = createMockSubscriptionCallbacks<Party | null>();
      const unsubscribe = repository.subscribeToMyParty('user-1', callbacks);

      expect(callbacks.onData).toHaveBeenCalledWith(null);
      unsubscribe();
    });

    it('should return user party when user is member', () => {
      const party = createMockParty({
        id: 'party-1',
        members: ['user-1', 'user-2'],
        status: 'open',
      });
      repository.setMockData([party]);

      const callbacks = createMockSubscriptionCallbacks<Party | null>();
      const unsubscribe = repository.subscribeToMyParty('user-1', callbacks);

      expect(callbacks.onData).toHaveBeenCalledWith(party);
      unsubscribe();
    });

    it('should return null when user party is ended', () => {
      const party = createMockParty({
        id: 'party-1',
        members: ['user-1'],
        status: 'ended',
      });
      repository.setMockData([party]);

      const callbacks = createMockSubscriptionCallbacks<Party | null>();
      const unsubscribe = repository.subscribeToMyParty('user-1', callbacks);

      expect(callbacks.onData).toHaveBeenCalledWith(null);
      unsubscribe();
    });
  });

  describe('createParty', () => {
    it('should create party and return id', async () => {
      const partyId = await repository.createParty({
        leaderId: 'user-1',
        departure: { name: '성결대학교', lat: 37.4, lng: 127.0 },
        destination: { name: '강남역', lat: 37.5, lng: 127.0 },
        departureTime: new Date().toISOString(),
        maxMembers: 4,
        members: ['user-1'],
        status: 'open',
      });

      expect(partyId).toBeDefined();
      expect(typeof partyId).toBe('string');

      const party = await repository.getParty(partyId);
      expect(party).not.toBeNull();
      expect(party?.leaderId).toBe('user-1');
    });
  });

  describe('updateParty', () => {
    it('should update party fields', async () => {
      const party = createMockParty({ id: 'party-1', maxMembers: 4 });
      repository.setMockData([party]);

      await repository.updateParty('party-1', { maxMembers: 3 });

      const updatedParty = await repository.getParty('party-1');
      expect(updatedParty?.maxMembers).toBe(3);
    });
  });

  describe('deleteParty', () => {
    it('should soft delete party by setting status to ended', async () => {
      const party = createMockParty({ id: 'party-1', status: 'open' });
      repository.setMockData([party]);

      await repository.deleteParty('party-1', 'cancelled');

      const deletedParty = await repository.getParty('party-1');
      expect(deletedParty?.status).toBe('ended');
      expect(deletedParty?.endReason).toBe('cancelled');
    });
  });

  describe('addMember', () => {
    it('should add user to party members', async () => {
      const party = createMockParty({ id: 'party-1', members: ['user-1'] });
      repository.setMockData([party]);

      await repository.addMember('party-1', 'user-2');

      const updatedParty = await repository.getParty('party-1');
      expect(updatedParty?.members).toContain('user-2');
    });

    it('should not duplicate member', async () => {
      const party = createMockParty({ id: 'party-1', members: ['user-1'] });
      repository.setMockData([party]);

      await repository.addMember('party-1', 'user-1');

      const updatedParty = await repository.getParty('party-1');
      expect(updatedParty?.members.filter((m) => m === 'user-1')).toHaveLength(1);
    });
  });

  describe('removeMember', () => {
    it('should remove user from party members', async () => {
      const party = createMockParty({
        id: 'party-1',
        members: ['user-1', 'user-2'],
      });
      repository.setMockData([party]);

      await repository.removeMember('party-1', 'user-2');

      const updatedParty = await repository.getParty('party-1');
      expect(updatedParty?.members).not.toContain('user-2');
    });
  });

  describe('getParty', () => {
    it('should return null for non-existent party', async () => {
      const party = await repository.getParty('non-existent');
      expect(party).toBeNull();
    });

    it('should return party for existing id', async () => {
      const mockParty = createMockParty({ id: 'party-1' });
      repository.setMockData([mockParty]);

      const party = await repository.getParty('party-1');
      expect(party).toEqual(mockParty);
    });
  });
});
