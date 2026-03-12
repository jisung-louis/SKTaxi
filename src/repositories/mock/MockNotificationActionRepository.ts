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

  async deleteJoinRequestNotifications(_userId: string, _partyId: string): Promise<void> {
    // Mock: 알림 삭제 완료
  }

  // 테스트용 헬퍼
  setJoinRequestStatus(requestId: string, status: JoinRequestStatusValue): void {
    this.joinRequests.set(requestId, status);
  }
}
