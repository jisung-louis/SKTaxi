export const ALLOWED_EMAIL_DOMAINS = ['sungkyul.ac.kr'];

export {
  logAnalyticsEvent,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
} from './analytics';
export { authInstance, subscribeAuthStateChange } from './auth';
export { logCrashlyticsMessage } from './crashlytics';
export { db } from './firestore';
export {
  getCurrentFcmToken,
  getInitialNotificationMessage,
  registerBackgroundMessageHandler,
  subscribeForegroundMessages,
  subscribeMessagingTokenRefresh,
  subscribeNotificationOpenedApp,
} from './messaging';
export { FirestoreStorageRepository } from './storageRepository';
export type {
  IStorageRepository,
  UploadOptions,
  UploadProgressCallback,
  UploadResult,
} from './storageRepository';
