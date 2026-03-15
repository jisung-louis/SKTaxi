export type JoinRequestStatusValue = 'pending' | 'accepted' | 'declined' | 'canceled';

export interface INotificationActionRepository {
  getJoinRequestStatus(requestId: string): Promise<JoinRequestStatusValue | null>;
  deleteJoinRequestNotifications(userId: string, partyId: string): Promise<void>;
}
