// SKTaxi: 알림 액션 Repository 인터페이스
// 동승 요청 승인/거절 등 알림 관련 액션을 추상화

export type JoinRequestStatusValue = 'pending' | 'accepted' | 'declined' | 'canceled';

export interface INotificationActionRepository {
  /**
   * 동승 요청 상태를 조회합니다
   * @param requestId - 동승 요청 ID
   */
  getJoinRequestStatus(requestId: string): Promise<JoinRequestStatusValue | null>;

  /**
   * 동승 요청을 승인합니다
   * @param requestId - 동승 요청 ID
   * @param partyId - 파티 ID
   * @param requesterId - 요청자 ID
   */
  acceptJoinRequest(requestId: string, partyId: string, requesterId: string): Promise<void>;

  /**
   * 동승 요청을 거절합니다
   * @param requestId - 동승 요청 ID
   */
  declineJoinRequest(requestId: string): Promise<void>;

  /**
   * 사용자의 동승 요청 알림을 삭제합니다
   * @param userId - 사용자 ID
   * @param partyId - 파티 ID
   */
  deleteJoinRequestNotifications(userId: string, partyId: string): Promise<void>;

  /**
   * 사용자 표시 이름을 조회합니다
   * @param userId - 사용자 ID
   */
  getUserDisplayName(userId: string): Promise<string>;
}
