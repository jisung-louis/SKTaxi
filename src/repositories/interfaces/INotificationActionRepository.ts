// SKTaxi: 알림 액션 Repository 인터페이스
// 동승 요청 상태 조회/알림 정리 액션을 추상화

export type JoinRequestStatusValue = 'pending' | 'accepted' | 'declined' | 'canceled';

export interface INotificationActionRepository {
  /**
   * 동승 요청 상태를 조회합니다
   * @param requestId - 동승 요청 ID
   */
  getJoinRequestStatus(requestId: string): Promise<JoinRequestStatusValue | null>;

  /**
   * 사용자의 동승 요청 알림을 삭제합니다
   * @param userId - 사용자 ID
   * @param partyId - 파티 ID
   */
  deleteJoinRequestNotifications(userId: string, partyId: string): Promise<void>;
}
