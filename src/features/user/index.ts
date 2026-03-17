export { NotificationSettingItem } from './components/NotificationSettingItem';
export {MyPageMenuSection} from './components/v2/MyPageMenuSection';
export {MyPageStatCard} from './components/v2/MyPageStatCard';

export { FirebaseUserRepository } from './data/repositories/FirebaseUserRepository';
export type {IMyPageRepository} from './data/repositories/IMyPageRepository';
export {
  FirebaseNotificationRepository,
  FirestoreNotificationRepository,
} from './data/repositories/FirebaseNotificationRepository';
export type {
  INotificationRepository,
  Notification,
} from './data/repositories/INotificationRepository';
export type { IUserRepository } from './data/repositories/IUserRepository';
export type { UseInAppNotificationsResult } from './hooks/useInAppNotifications';

export { useUserRepository } from './hooks/useUserRepository';
export {useMyPageData} from './hooks/useMyPageData';
export {
  useUserProfile,
  useUserProfileById,
} from './hooks/useUserProfile';
export type { UseUserProfileResult } from './hooks/useUserProfile';
export { useAccountInfo } from './hooks/useAccountInfo';
export type {
  AccountInfo,
  UseAccountInfoResult,
} from './hooks/useAccountInfo';
export { useNotificationSettings } from './hooks/useNotificationSettings';
export type {
  NotificationSettings,
  UseNotificationSettingsResult,
} from './hooks/useNotificationSettings';
export { useInAppNotifications } from './hooks/useInAppNotifications';
export { useUserDisplayNames } from './hooks/useUserDisplayNames';
export type { UseUserDisplayNamesResult } from './hooks/useUserDisplayNames';
export { useUserBookmarks } from './hooks/useUserBookmarks';
export type { UseUserBookmarksResult } from './hooks/useUserBookmarks';

export type {
  MyPageMenuActionKey,
  MyPageMenuItemSource,
  MyPageMenuSectionSource,
  MyPageProfileSource,
  MyPageSource,
  MyPageStatSource,
} from './model/myPageSource';
export type {
  MyPageMenuItemViewData,
  MyPageMenuSectionViewData,
  MyPageProfileViewData,
  MyPageScreenViewData,
  MyPageStatViewData,
} from './model/myPageViewData';
export type {
  UserAgreements,
  UserDoc,
  UserDisplayNameMap,
  UserLoginProvider,
  UserNotificationSettings,
  UserOnboardingState,
  UserProfile,
} from './model/types';
export type { LinkedAccount, UserAccountInfo } from '@/shared/types/user';

export { ProfileScreen } from './screens/ProfileScreen';
export { ProfileEditScreen } from './screens/ProfileEditScreen';
export { AccountModificationScreen } from './screens/AccountModificationScreen';
export { NotificationScreen } from './screens/NotificationScreen';
export { NotificationSettingsScreen } from './screens/NotificationSettingsScreen';
export {MockMyPageRepository} from './data/repositories/MockMyPageRepository';

export {
  completeUserPermissionOnboarding,
  createInitialUserProfile,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_USER_DISPLAY_NAME,
  deleteUserAccountInfo,
  getUserLoginProvider,
  resolveNotificationSettings,
  resolveUserAccountInfo,
  saveCompletedUserProfile,
  saveUserAccountInfo,
  saveUserProfileChanges,
  syncUserLoginMetadata,
  updateUserNotificationSettings,
  withdrawCurrentUser,
} from './services/userProfileService';
export {
  clearUserFcmTokens,
  saveUserFcmToken,
  subscribeUserFcmTokenRefresh,
} from './services/fcmTokenService';
