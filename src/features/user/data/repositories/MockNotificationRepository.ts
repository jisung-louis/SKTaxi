// SKTaxi: Notification Repository Mock 구현체
// 테스트 및 개발용 Mock 데이터 제공

import {
  INotificationRepository,
  Notification,
} from './INotificationRepository';
import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from './IUserRepository';

/**
 * Mock Notification Repository 구현체
 */
export class MockNotificationRepository implements INotificationRepository {
  private notifications: Map<string, Notification[]> = new Map();

  constructor() {
    // 기본 테스트 알림 추가
    this.notifications.set('user1', [
      {
        id: 'notif1',
        type: 'party_join_request',
        title: '동승 요청',
        message: '테스트 사용자 2님이 동승을 요청했습니다.',
        data: { partyId: 'party1', requesterId: 'user2' },
        isRead: false,
        createdAt: new Date(),
      },
    ]);
  }

  subscribeToNotifications(
    userId: string,
    limit: number,
    callbacks: SubscriptionCallbacks<Notification[]>,
  ): Unsubscribe {
    const notifs = (this.notifications.get(userId) || []).slice(0, limit);
    setTimeout(() => callbacks.onData(notifs), 10);
    return () => {};
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const userNotifs = this.notifications.get(userId) || [];
    const updated = userNotifs.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true, readAt: new Date() }
        : notification,
    );
    this.notifications.set(userId, updated);
  }

  async markAllAsRead(userId: string, notificationIds: string[]): Promise<void> {
    const userNotifs = this.notifications.get(userId) || [];
    const updated = userNotifs.map(notification =>
      notificationIds.includes(notification.id)
        ? { ...notification, isRead: true, readAt: new Date() }
        : notification,
    );
    this.notifications.set(userId, updated);
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const userNotifs = this.notifications.get(userId) || [];
    this.notifications.set(
      userId,
      userNotifs.filter(notification => notification.id !== notificationId),
    );
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    this.notifications.set(userId, []);
  }

  async deleteNotificationsByPartyId(userId: string, partyId: string): Promise<void> {
    const userNotifs = this.notifications.get(userId) || [];
    this.notifications.set(
      userId,
      userNotifs.filter(
        notification => (notification.data as any)?.partyId !== partyId,
      ),
    );
  }

  // 테스트용 헬퍼 메서드
  addMockNotification(userId: string, notification: Notification): void {
    const notifs = this.notifications.get(userId) || [];
    this.notifications.set(userId, [notification, ...notifs]);
  }

  clearMockData(): void {
    this.notifications.clear();
  }
}
