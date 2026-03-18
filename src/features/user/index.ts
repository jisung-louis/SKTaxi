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
export {useAccountManagementData} from './hooks/useAccountManagementData';
export {useMyPageData} from './hooks/useMyPageData';
export {useNotificationSettingsScreenData} from './hooks/useNotificationSettingsScreenData';
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
export {useBookmarksScreenData} from './hooks/useBookmarksScreenData';
export { useInAppNotifications } from './hooks/useInAppNotifications';
export {useMyPostsScreenData} from './hooks/useMyPostsScreenData';
export {useProfileEditScreenData} from './hooks/useProfileEditScreenData';
export {useTaxiHistoryScreenData} from './hooks/useTaxiHistoryScreenData';
export { useUserDisplayNames } from './hooks/useUserDisplayNames';
export type { UseUserDisplayNamesResult } from './hooks/useUserDisplayNames';
export { useUserBookmarks } from './hooks/useUserBookmarks';
export type { UseUserBookmarksResult } from './hooks/useUserBookmarks';

export type {
  MyPageMenuActionKey,
  MyPageProfileSource,
  MyPageSource,
  MyPageStatKey,
} from './model/myPageSource';
export type {
  AccountManagementScreenViewData,
} from './model/accountManagementViewData';
export type {
  AccountManagementAccountSource,
  AccountManagementSource,
} from './model/accountManagementSource';
export type {
  ProfileEditDraft,
  ProfileEditSource,
} from './model/profileEditSource';
export type {ProfileEditScreenViewData} from './model/profileEditViewData';
export type {
  MyPageMenuItemViewData,
  MyPageMenuSectionViewData,
  MyPageProfileViewData,
  MyPageScreenViewData,
  MyPageStatViewData,
} from './model/myPageViewData';
export type {
  BookmarksSource,
  TaxiHistoryEntrySource,
  TaxiHistorySource,
  UserNoticeBookmarkItemSource,
  UserPostListItemSource,
} from './model/userActivitySource';
export type {
  BookmarksScreenViewData,
  MyPostsScreenViewData,
  TaxiHistoryScreenViewData,
} from './model/userActivityViewData';
export type {
  NotificationSettingItemViewData,
  NotificationSettingMasterViewData,
  NotificationSettingsScreenViewData,
} from './model/notificationSettingsViewData';
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

export { MyScreen } from './screens/MyScreen';
export { BookmarksScreen } from './screens/BookmarksScreen';
export { ProfileEditScreen } from './screens/ProfileEditScreen';
export { AccountModificationScreen } from './screens/AccountModificationScreen';
export { MyPostsScreen } from './screens/MyPostsScreen';
export { NotificationScreen } from './screens/NotificationScreen';
export { NotificationSettingsScreen } from './screens/NotificationSettingsScreen';
export { TaxiHistoryScreen } from './screens/TaxiHistoryScreen';
export {MockAccountManagementRepository} from './data/repositories/MockAccountManagementRepository';
export {MockMyPageRepository} from './data/repositories/MockMyPageRepository';
export {MockNotificationSettingsScreenRepository} from './data/repositories/MockNotificationSettingsScreenRepository';
export {MockProfileEditRepository} from './data/repositories/MockProfileEditRepository';
export {MockUserActivityRepository} from './data/repositories/MockUserActivityRepository';

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
