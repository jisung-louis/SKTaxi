// SKTaxi: Notification Action Repository Mock 구현체 (테스트용)

import {
  INotificationActionRepository,
  JoinRequestStatusValue,
} from '../interfaces/INotificationActionRepository';

export class MockNotificationActionRepository implements INotificationActionRepository {
  private joinRequests: Map<string, JoinRequestStatusValue> = new Map();

  async getJoinRequestStatus(requestId: string): Promise<JoinRequestStatusValue | null> {
    return this.joinRequests.get(requestId) || null;
  }

  async acceptJoinRequest(requestId: string, _partyId: string, _requesterId: string): Promise<void> {
    this.joinRequests.set(requestId, 'accepted');
  }

  async declineJoinRequest(requestId: string): Promise<void> {
    this.joinRequests.set(requestId, 'declined');
  }

  async deleteJoinRequestNotifications(_userId: string, _partyId: string): Promise<void> {
    // Mock: 알림 삭제 완료
  }

  async getUserDisplayName(_userId: string): Promise<string> {
    return 'Mock User';
  }

  // 테스트용 헬퍼
  setJoinRequestStatus(requestId: string, status: JoinRequestStatusValue): void {
    this.joinRequests.set(requestId, status);
  }
}
