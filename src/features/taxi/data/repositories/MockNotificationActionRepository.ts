import type {
  INotificationActionRepository,
  JoinRequestStatusValue,
} from './INotificationActionRepository';

export class MockNotificationActionRepository
  implements INotificationActionRepository
{
  async getJoinRequestStatus(
    _requestId: string,
  ): Promise<JoinRequestStatusValue | null> {
    return null;
  }

  async deleteJoinRequestNotifications(
    _userId: string,
    _requestId: string,
  ): Promise<void> {}
}
