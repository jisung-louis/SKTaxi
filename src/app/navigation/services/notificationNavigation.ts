import type {NotificationNavigationIntent} from '@/app/notifications/model/notificationNavigationIntent';
import {
  getPushNotificationNavigationIntent,
  getStoredNotificationNavigationIntent,
  openNotificationNavigationIntent,
} from '@/app/notifications/services/notificationRouter';
import type {NotificationPayload} from '@/app/notifications/model/notificationPayload';
import {parsePushNotificationPayload} from '@/app/notifications/services/notificationPayloadParser';
import type {Notification} from '@/features/user/data/repositories/INotificationRepository';

export const handlePushNotificationNavigation = ({
  data,
  onJoinRequestReceived,
}: {
  data: Record<string, unknown>;
  onJoinRequestReceived?: (payload: Extract<NotificationPayload, {type: 'PARTY_JOIN_REQUEST'}>) => void;
}) => {
  const payload = parsePushNotificationPayload(data);

  if (!payload) {
    return false;
  }

  if (payload.type === 'PARTY_JOIN_REQUEST') {
    onJoinRequestReceived?.(payload);
  }

  return openNotificationNavigationIntent(getPushNotificationNavigationIntent(data));
};

export const handleForegroundNotificationNavigation = ({
  intent,
}: {
  intent: NotificationNavigationIntent | null | undefined;
}) => openNotificationNavigationIntent(intent ?? null);

export const handleStoredNotificationNavigation = ({
  notification,
}: {
  notification: Notification;
}) => openNotificationNavigationIntent(getStoredNotificationNavigationIntent(notification));

export {
  getPushNotificationNavigationIntent,
  getStoredNotificationNavigationIntent,
  openNotificationNavigationIntent,
};
