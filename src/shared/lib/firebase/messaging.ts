import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export type { FirebaseMessagingTypes };

export const subscribeForegroundMessages = (
  _listener: (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => void | Promise<void>,
) => () => {};

export const registerBackgroundMessageHandler = (
  _listener: (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => Promise<void>,
) => {};

export const subscribeNotificationOpenedApp = (
  _listener: (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void,
) => () => {};

export const getInitialNotificationMessage = async (): Promise<FirebaseMessagingTypes.RemoteMessage | null> => null;

export const getCurrentFcmToken = async () => null;

export const subscribeMessagingTokenRefresh = (
  _listener: (token: string) => void | Promise<void>,
) => () => {};
