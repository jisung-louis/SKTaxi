import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

import {notificationApiClient} from '../api/notificationApiClient';
import {mapNotificationResponseDto} from '../mappers/notificationMapper';
import type {
  INotificationRepository,
  Notification,
} from './INotificationRepository';

interface NotificationSubscription {
  callbacks: SubscriptionCallbacks<Notification[]>;
  intervalId: ReturnType<typeof setInterval>;
  limit: number;
}

const NOTIFICATION_PAGE_SIZE = 100;
const NOTIFICATION_POLLING_MS = 30_000;

export class SpringNotificationRepository implements INotificationRepository {
  private readonly subscribers = new Map<
    string,
    Set<NotificationSubscription>
  >();

  async deleteAllNotifications(userId: string): Promise<void> {
    const notifications = await this.listAllNotifications();

    if (notifications.length === 0) {
      return;
    }

    await Promise.all(
      notifications.map(notification =>
        notificationApiClient.deleteNotification(notification.id),
      ),
    );
    await this.refreshUserSubscriptions(userId);
  }

  async deleteNotification(
    userId: string,
    notificationId: string,
  ): Promise<void> {
    await notificationApiClient.deleteNotification(notificationId);
    await this.refreshUserSubscriptions(userId);
  }

  async deleteNotificationsByPartyId(
    userId: string,
    partyId: string,
  ): Promise<void> {
    const notifications = await this.listAllNotifications();
    const targetIds = notifications
      .filter(notification => notification.data.partyId === partyId)
      .map(notification => notification.id);

    if (targetIds.length === 0) {
      return;
    }

    await Promise.all(
      targetIds.map(notificationId =>
        notificationApiClient.deleteNotification(notificationId),
      ),
    );
    await this.refreshUserSubscriptions(userId);
  }

  async getNotifications(
    _userId: string,
    limit: number,
  ): Promise<Notification[]> {
    const response = await notificationApiClient.getNotifications({
      page: 0,
      size: Math.min(Math.max(limit, 1), NOTIFICATION_PAGE_SIZE),
    });

    return response.data.content.map(mapNotificationResponseDto);
  }

  async markAllAsRead(
    userId: string,
    _notificationIds: string[],
  ): Promise<void> {
    await notificationApiClient.markAllAsRead();
    await this.refreshUserSubscriptions(userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await notificationApiClient.markAsRead(notificationId);
    await this.refreshUserSubscriptions(userId);
  }

  subscribeToNotifications(
    userId: string,
    limit: number,
    callbacks: SubscriptionCallbacks<Notification[]>,
  ): Unsubscribe {
    const intervalId = setInterval(() => {
      this.publishNotifications(userId, limit, callbacks);
    }, NOTIFICATION_POLLING_MS);

    const subscription: NotificationSubscription = {
      callbacks,
      intervalId,
      limit,
    };
    const bucket = this.subscribers.get(userId) ?? new Set();
    bucket.add(subscription);
    this.subscribers.set(userId, bucket);

    this.publishNotifications(userId, limit, callbacks);

    return () => {
      clearInterval(intervalId);
      const currentBucket = this.subscribers.get(userId);

      if (!currentBucket) {
        return;
      }

      currentBucket.delete(subscription);

      if (currentBucket.size === 0) {
        this.subscribers.delete(userId);
      }
    };
  }

  private async listAllNotifications(): Promise<Notification[]> {
    const notifications: Notification[] = [];
    let page = 0;
    let hasNext = true;

    while (hasNext) {
      const response = await notificationApiClient.getNotifications({
        page,
        size: NOTIFICATION_PAGE_SIZE,
      });

      notifications.push(
        ...response.data.content.map(mapNotificationResponseDto),
      );

      hasNext = Boolean(response.data.hasNext);
      page += 1;
    }

    return notifications;
  }

  private async publishNotifications(
    userId: string,
    limit: number,
    callbacks: SubscriptionCallbacks<Notification[]>,
  ) {
    try {
      const notifications = await this.getNotifications(userId, limit);
      callbacks.onData(notifications);
    } catch (error) {
      callbacks.onError(error as Error);
    }
  }

  private async refreshUserSubscriptions(userId: string) {
    const bucket = this.subscribers.get(userId);

    if (!bucket || bucket.size === 0) {
      return;
    }

    await Promise.all(
      Array.from(bucket).map(subscription =>
        this.publishNotifications(
          userId,
          subscription.limit,
          subscription.callbacks,
        ),
      ),
    );
  }
}
