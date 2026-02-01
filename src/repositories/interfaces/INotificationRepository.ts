// SKTaxi: Notification Repository 인터페이스 - DIP 원칙 적용
// 알림 관련 데이터 접근 추상화

import { Unsubscribe, SubscriptionCallbacks } from './IPartyRepository';

/**
 * 알림 데이터
 */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  icon?: string;
  iconColor?: string;
}

/**
 * Notification Repository 인터페이스
 */
export interface INotificationRepository {
  /**
   * 사용자 알림 목록 실시간 구독
   * @param userId - 사용자 ID
   * @param limit - 가져올 알림 수
   * @param callbacks - 데이터 및 에러 콜백
   * @returns 구독 해제 함수
   */
  subscribeToNotifications(
    userId: string,
    limit: number,
    callbacks: SubscriptionCallbacks<Notification[]>
  ): Unsubscribe;

  /**
   * 알림 읽음 처리
   * @param userId - 사용자 ID
   * @param notificationId - 알림 ID
   */
  markAsRead(userId: string, notificationId: string): Promise<void>;

  /**
   * 모든 알림 읽음 처리
   * @param userId - 사용자 ID
   * @param notificationIds - 읽음 처리할 알림 ID 목록
   */
  markAllAsRead(userId: string, notificationIds: string[]): Promise<void>;

  /**
   * 알림 삭제
   * @param userId - 사용자 ID
   * @param notificationId - 알림 ID
   */
  deleteNotification(userId: string, notificationId: string): Promise<void>;

  /**
   * 모든 알림 삭제
   * @param userId - 사용자 ID
   */
  deleteAllNotifications(userId: string): Promise<void>;

  /**
   * 특정 파티 관련 알림 모두 삭제
   * @param userId - 사용자 ID
   * @param partyId - 파티 ID
   */
  deleteNotificationsByPartyId(userId: string, partyId: string): Promise<void>;
}
