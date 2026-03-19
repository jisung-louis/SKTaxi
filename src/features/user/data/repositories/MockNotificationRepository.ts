import type {
  INotificationRepository,
  Notification,
} from './INotificationRepository';
import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import { NOTIFICATION_CENTER_MOCK } from '../../mocks/notificationCenter.mock';

const notificationsByUser = new Map<string, Notification[]>();
const subscribers = new Map<
  string,
  Set<SubscriptionCallbacks<Notification[]>>
>();

const cloneNotification = (notification: Notification): Notification => ({
  ...notification,
  createdAt: new Date(notification.createdAt),
  readAt: notification.readAt ? new Date(notification.readAt) : undefined,
});

const createSeedNotifications = (): Notification[] =>
  NOTIFICATION_CENTER_MOCK.map(item => ({
    ...item.notification,
    createdAt: new Date(item.notification.createdAt),
    readAt: item.notification.readAt
      ? new Date(item.notification.readAt)
      : undefined,
    icon: item.iconName,
    iconColor: item.iconTone,
  }));

const ensureNotifications = (userId: string) => {
  if (!notificationsByUser.has(userId)) {
    notificationsByUser.set(userId, createSeedNotifications());
  }

  return notificationsByUser.get(userId)!;
};

const emitNotifications = (userId: string) => {
  const nextValue = ensureNotifications(userId).map(cloneNotification);
  subscribers.get(userId)?.forEach(callbacks => {
    callbacks.onData(nextValue);
  });
};

export class MockNotificationRepository implements INotificationRepository {
  async getNotifications(userId: string, limit: number): Promise<Notification[]> {
    return ensureNotifications(userId).slice(0, limit).map(cloneNotification);
  }

  subscribeToNotifications(
    userId: string,
    limit: number,
    callbacks: SubscriptionCallbacks<Notification[]>,
  ): Unsubscribe {
    const bucket = subscribers.get(userId) ?? new Set();
    bucket.add(callbacks);
    subscribers.set(userId, bucket);

    callbacks.onData(ensureNotifications(userId).slice(0, limit).map(cloneNotification));

    return () => {
      subscribers.get(userId)?.delete(callbacks);
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    notificationsByUser.set(
      userId,
      ensureNotifications(userId).map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date() }
          : notification,
      ),
    );
    emitNotifications(userId);
  }

  async markAllAsRead(userId: string, notificationIds: string[]): Promise<void> {
    const targetIds = new Set(notificationIds);
    notificationsByUser.set(
      userId,
      ensureNotifications(userId).map(notification =>
        targetIds.has(notification.id)
          ? { ...notification, isRead: true, readAt: new Date() }
          : notification,
      ),
    );
    emitNotifications(userId);
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    notificationsByUser.set(
      userId,
      ensureNotifications(userId).filter(notification => notification.id !== notificationId),
    );
    emitNotifications(userId);
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    notificationsByUser.set(userId, []);
    emitNotifications(userId);
  }

  async deleteNotificationsByPartyId(userId: string, partyId: string): Promise<void> {
    notificationsByUser.set(
      userId,
      ensureNotifications(userId).filter(
        notification => notification.data.partyId !== partyId,
      ),
    );
    emitNotifications(userId);
  }
}
