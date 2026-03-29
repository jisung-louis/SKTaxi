export {MyPageMenuSection} from './components/MyPageMenuSection';
export {MyPageStatCard} from './components/MyPageStatCard';

export type {IMyPageRepository} from './data/repositories/IMyPageRepository';
export {SpringNotificationRepository} from './data/repositories/SpringNotificationRepository';
export type {
  INotificationRepository,
  Notification,
} from './data/repositories/INotificationRepository';
export type {UseInAppNotificationsResult} from './hooks/useInAppNotifications';

export {useAccountManagementData} from './hooks/useAccountManagementData';
export {useMyPageData} from './hooks/useMyPageData';
export {useNotificationSettingsScreenData} from './hooks/useNotificationSettingsScreenData';
export {useNotificationSettings} from './hooks/useNotificationSettings';
export type {
  NotificationSettings,
  UseNotificationSettingsResult,
} from './hooks/useNotificationSettings';
export {useBookmarksScreenData} from './hooks/useBookmarksScreenData';
export {useInAppNotifications} from './hooks/useInAppNotifications';
export {useMyPostsScreenData} from './hooks/useMyPostsScreenData';
export {useProfileEditScreenData} from './hooks/useProfileEditScreenData';
export {useTaxiHistoryScreenData} from './hooks/useTaxiHistoryScreenData';
export {useUserDisplayNames} from './hooks/useUserDisplayNames';
export type {UseUserDisplayNamesResult} from './hooks/useUserDisplayNames';

export type {
  MyPageMenuActionKey,
  MyPageProfileSource,
  MyPageSource,
  MyPageStatKey,
} from './model/myPageSource';
export type {AccountManagementScreenViewData} from './model/accountManagementViewData';
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
export type {LinkedAccount, UserAccountInfo} from '@/shared/types/user';

export {MyScreen} from './screens/MyScreen';
export {BookmarksScreen} from './screens/BookmarksScreen';
export {ProfileEditScreen} from './screens/ProfileEditScreen';
export {AccountModificationScreen} from './screens/AccountModificationScreen';
export {MyPostsScreen} from './screens/MyPostsScreen';
export {NotificationScreen} from './screens/NotificationScreen';
export {NotificationSettingsScreen} from './screens/NotificationSettingsScreen';
export {TaxiHistoryScreen} from './screens/TaxiHistoryScreen';

export {
  DEFAULT_USER_DISPLAY_NAME,
  getUserLoginProvider,
  withdrawCurrentUser,
} from './services/userProfileService';
