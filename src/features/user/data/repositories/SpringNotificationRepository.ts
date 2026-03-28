import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';
import {
  RepositoryError,
  RepositoryErrorCode,
} from '@/shared/lib/errors';
import {
  createXhrSseStream,
  sseClient,
  type SseStreamConnection,
  type SseStreamEvent,
} from '@/shared/realtime';

import {notificationApiClient} from '../api/notificationApiClient';
import type {
  NotificationResponseDto,
  NotificationSnapshotResponseDto,
  NotificationUnreadCountResponseDto,
} from '../dto/notificationDto';
import {mapNotificationResponseDto} from '../mappers/notificationMapper';
import type {
  INotificationRepository,
  Notification,
} from './INotificationRepository';

interface NotificationSubscription {
  callbacks: SubscriptionCallbacks<Notification[]>;
  limit: number;
}

interface NotificationUserState {
  connection: SseStreamConnection | null;
  connectionPromise: Promise<void> | null;
  initialized: boolean;
  lastEventId?: string;
  notifications: Notification[];
  reconnectDelayMs: number | null;
  reconnectTimerId: ReturnType<typeof setTimeout> | null;
  refreshPromise: Promise<Notification[]> | null;
  subscriptions: Set<NotificationSubscription>;
  unreadCountHint: number | null;
}

const NOTIFICATION_PAGE_SIZE = 100;

const cloneNotification = (notification: Notification): Notification => ({
  ...notification,
  createdAt: new Date(notification.createdAt),
  data: {...notification.data},
  readAt: notification.readAt ? new Date(notification.readAt) : undefined,
});

const createSubscriptionError = (error: unknown) => {
  if (error instanceof RepositoryError) {
    return error;
  }

  if (error instanceof Error) {
    return new RepositoryError(
      RepositoryErrorCode.SUBSCRIPTION_FAILED,
      error.message,
      {
        originalError: error,
      },
    );
  }

  return new RepositoryError(
    RepositoryErrorCode.SUBSCRIPTION_FAILED,
    '알림 실시간 연결에 실패했습니다.',
  );
};

const shouldIncludeInUnreadCount = (notification: Notification) =>
  notification.type !== 'app_notice';

const countUnreadNotifications = (notifications: Notification[]) =>
  notifications.reduce(
    (count, notification) =>
      count +
      (notification.isRead || !shouldIncludeInUnreadCount(notification) ? 0 : 1),
    0,
  );

const sortNotifications = (notifications: Notification[]) =>
  [...notifications].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  );

const parseJsonPayload = <T>(value?: string): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export class SpringNotificationRepository implements INotificationRepository {
  private readonly userStates = new Map<string, NotificationUserState>();

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

    const state = this.getOrCreateUserState(userId);
    state.notifications = [];
    state.unreadCountHint = 0;
    state.initialized = true;
    this.publishUserState(userId);
  }

  async deleteNotification(
    userId: string,
    notificationId: string,
  ): Promise<void> {
    await notificationApiClient.deleteNotification(notificationId);

    const state = this.getOrCreateUserState(userId);
    const nextNotifications = state.notifications.filter(
      notification => notification.id !== notificationId,
    );

    if (nextNotifications.length !== state.notifications.length) {
      state.notifications = nextNotifications;
      state.unreadCountHint = countUnreadNotifications(nextNotifications);
      state.initialized = true;
      this.publishUserState(userId);
    } else {
      await this.refreshUserState(userId);
    }
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

    const state = this.getOrCreateUserState(userId);
    state.notifications = state.notifications.filter(
      notification => notification.data.partyId !== partyId,
    );
    state.unreadCountHint = countUnreadNotifications(state.notifications);
    state.initialized = true;
    this.publishUserState(userId);
  }

  async getNotifications(
    userId: string,
    limit: number,
  ): Promise<Notification[]> {
    const notifications = await this.refreshUserState(userId);

    return notifications
      .slice(0, Math.min(Math.max(limit, 1), NOTIFICATION_PAGE_SIZE))
      .map(cloneNotification);
  }

  async markAllAsRead(
    userId: string,
    _notificationIds: string[],
  ): Promise<void> {
    await notificationApiClient.markAllAsRead();

    const state = this.getOrCreateUserState(userId);
    state.notifications = state.notifications.map(notification => ({
      ...notification,
      isRead: true,
      readAt: notification.readAt ?? new Date(),
    }));
    state.unreadCountHint = 0;
    state.initialized = true;
    this.publishUserState(userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await notificationApiClient.markAsRead(notificationId);

    const state = this.getOrCreateUserState(userId);
    let changed = false;

    state.notifications = state.notifications.map(notification => {
      if (notification.id !== notificationId || notification.isRead) {
        return notification;
      }

      changed = true;
      return {
        ...notification,
        isRead: true,
        readAt: new Date(),
      };
    });

    if (changed) {
      state.unreadCountHint = countUnreadNotifications(state.notifications);
      state.initialized = true;
      this.publishUserState(userId);
      return;
    }

    await this.refreshUserState(userId);
  }

  subscribeToNotifications(
    userId: string,
    limit: number,
    callbacks: SubscriptionCallbacks<Notification[]>,
  ): Unsubscribe {
    const state = this.getOrCreateUserState(userId);
    const subscription: NotificationSubscription = {
      callbacks,
      limit,
    };

    state.subscriptions.add(subscription);

    if (state.initialized) {
      this.publishSubscription(userId, subscription);
    } else {
      this.refreshUserState(userId)
        .then(() => {
          this.publishSubscription(userId, subscription);
        })
        .catch(error => {
          callbacks.onError(error as Error);
        });
    }

    this.connectUserRealtime(userId).catch(() => undefined);

    return () => {
      const currentState = this.userStates.get(userId);

      if (!currentState) {
        return;
      }

      currentState.subscriptions.delete(subscription);

      if (currentState.subscriptions.size > 0) {
        return;
      }

      currentState.connection?.close();
      currentState.connection = null;

      if (currentState.reconnectTimerId) {
        clearTimeout(currentState.reconnectTimerId);
        currentState.reconnectTimerId = null;
      }
    };
  }

  private async connectUserRealtime(userId: string): Promise<void> {
    const state = this.getOrCreateUserState(userId);

    if (
      state.connection ||
      state.connectionPromise ||
      state.subscriptions.size === 0
    ) {
      return;
    }

    state.connectionPromise = (async () => {
      const connection = await sseClient.connect(
        {
          lastEventId: state.lastEventId,
          path: '/v1/sse/notifications',
        },
        {
          connect: options => {
            state.reconnectDelayMs = options.reconnectDelayMs;

            return createXhrSseStream(options, {
              onClosed: () => {
                if (state.connection === connection) {
                  state.connection = null;
                }

                this.scheduleReconnect(userId);
              },
              onError: error => {
                console.warn('알림 SSE 연결 오류:', error);
              },
              onEvent: event => {
                this.handleRealtimeEvent(userId, event).catch(() => undefined);
              },
              onOpen: () => {
                this.refreshUserState(userId).catch(() => undefined);
              },
            });
          },
        },
      );

      state.connection = connection;
    })()
      .catch(error => {
        console.warn('알림 SSE 연결 실패:', error);
        this.scheduleReconnect(userId);
      })
      .finally(() => {
        if (state.connectionPromise) {
          state.connectionPromise = null;
        }
      });

    await state.connectionPromise;
  }

  private getOrCreateUserState(userId: string): NotificationUserState {
    const existingState = this.userStates.get(userId);

    if (existingState) {
      return existingState;
    }

    const nextState: NotificationUserState = {
      connection: null,
      connectionPromise: null,
      initialized: false,
      notifications: [],
      reconnectDelayMs: null,
      reconnectTimerId: null,
      refreshPromise: null,
      subscriptions: new Set(),
      unreadCountHint: null,
    };

    this.userStates.set(userId, nextState);
    return nextState;
  }

  private async handleRealtimeEvent(
    userId: string,
    event: SseStreamEvent,
  ): Promise<void> {
    const state = this.getOrCreateUserState(userId);

    if (event.id) {
      state.lastEventId = event.id;
    }

    switch (event.event) {
      case 'SNAPSHOT': {
        const snapshot =
          parseJsonPayload<NotificationSnapshotResponseDto>(event.data);

        if (!snapshot) {
          return;
        }

        state.unreadCountHint = snapshot.unreadCount;

        if (
          state.initialized &&
          countUnreadNotifications(state.notifications) !== snapshot.unreadCount
        ) {
          await this.refreshUserState(userId);
        }
        return;
      }
      case 'NOTIFICATION': {
        const notificationDto =
          parseJsonPayload<NotificationResponseDto>(event.data);

        if (!notificationDto) {
          return;
        }

        const nextNotification = mapNotificationResponseDto(notificationDto);
        state.notifications = sortNotifications([
          nextNotification,
          ...state.notifications.filter(
            notification => notification.id !== nextNotification.id,
          ),
        ]).slice(0, NOTIFICATION_PAGE_SIZE);
        state.unreadCountHint = countUnreadNotifications(state.notifications);
        state.initialized = true;
        this.publishUserState(userId);
        return;
      }
      case 'UNREAD_COUNT_CHANGED': {
        const unreadCountPayload =
          parseJsonPayload<NotificationUnreadCountResponseDto>(event.data);

        if (!unreadCountPayload) {
          return;
        }

        state.unreadCountHint = unreadCountPayload.count;

        if (
          state.initialized &&
          countUnreadNotifications(state.notifications) !== unreadCountPayload.count
        ) {
          await this.refreshUserState(userId);
        }
        return;
      }
      case 'HEARTBEAT':
      default:
        return;
    }
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

  private publishSubscription(
    userId: string,
    subscription: NotificationSubscription,
  ) {
    const state = this.userStates.get(userId);

    if (!state) {
      return;
    }

    subscription.callbacks.onData(
      state.notifications
        .slice(0, Math.min(Math.max(subscription.limit, 1), NOTIFICATION_PAGE_SIZE))
        .map(cloneNotification),
    );
  }

  private publishUserState(userId: string) {
    const state = this.userStates.get(userId);

    if (!state || state.subscriptions.size === 0) {
      return;
    }

    state.subscriptions.forEach(subscription => {
      this.publishSubscription(userId, subscription);
    });
  }

  private async refreshUserState(userId: string): Promise<Notification[]> {
    const state = this.getOrCreateUserState(userId);

    if (state.refreshPromise) {
      return state.refreshPromise;
    }

    state.refreshPromise = Promise.all([
      notificationApiClient.getNotifications({
        page: 0,
        size: NOTIFICATION_PAGE_SIZE,
      }),
      notificationApiClient.getUnreadCount(),
    ])
      .then(([notificationsResponse, unreadCountResponse]) => {
        state.notifications = notificationsResponse.data.content.map(
          mapNotificationResponseDto,
        );
        state.unreadCountHint = unreadCountResponse.data.count;
        state.initialized = true;
        this.publishUserState(userId);
        return state.notifications.map(cloneNotification);
      })
      .catch(error => {
        throw createSubscriptionError(error);
      })
      .finally(() => {
        state.refreshPromise = null;
      });

    return state.refreshPromise;
  }

  private scheduleReconnect(userId: string) {
    const state = this.userStates.get(userId);

    if (
      !state ||
      state.subscriptions.size === 0 ||
      state.reconnectTimerId ||
      state.connectionPromise
    ) {
      return;
    }

    state.reconnectTimerId = setTimeout(() => {
      state.reconnectTimerId = null;
      this.connectUserRealtime(userId).catch(() => undefined);
    }, state.reconnectDelayMs ?? 3000);
  }
}
