import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

const messagingInstance = getMessaging();

export type { FirebaseMessagingTypes };

export const subscribeForegroundMessages = (
  listener: (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => void | Promise<void>,
) => onMessage(messagingInstance, listener);

export const registerBackgroundMessageHandler = (
  listener: (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => Promise<void>,
) => setBackgroundMessageHandler(messagingInstance, listener);

export const subscribeNotificationOpenedApp = (
  listener: (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void,
) => onNotificationOpenedApp(messagingInstance, listener);

export const getInitialNotificationMessage = () =>
  getInitialNotification(messagingInstance);

export const getCurrentFcmToken = () => getToken(messagingInstance);

export const subscribeMessagingTokenRefresh = (
  listener: (token: string) => void | Promise<void>,
) =>
  onTokenRefresh(messagingInstance, async token => {
    if (!token) {
      return;
    }

    await listener(token);
  });
