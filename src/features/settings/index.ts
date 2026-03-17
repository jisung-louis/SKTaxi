export { TermsOfUseContent } from './components/TermsOfUseContent';

export {
  FirebaseAppConfigRepository,
  FirestoreAppConfigRepository,
} from './data/repositories/FirebaseAppConfigRepository';
export {
  FirebaseAppNoticeRepository,
  FirestoreAppNoticeRepository,
} from './data/repositories/FirebaseAppNoticeRepository';
export {
  FirebaseInquiryRepository,
  FirestoreInquiryRepository,
} from './data/repositories/FirebaseInquiryRepository';
export type {
  AppNotice,
  IAppNoticeRepository,
} from './data/repositories/IAppNoticeRepository';
export type {
  AppVersionInfo,
  IAppConfigRepository,
  VersionModalConfig,
} from './data/repositories/IAppConfigRepository';
export type {IAppSettingRepository} from './data/repositories/IAppSettingRepository';
export type {
  CreateInquiryData,
  Inquiry,
  InquiryType,
  IInquiryRepository,
} from './data/repositories/IInquiryRepository';

export {useAppSettingData} from './hooks/useAppSettingData';
export { useAppNotice } from './hooks/useAppNotice';
export type { UseAppNoticeResult } from './hooks/useAppNotice';
export { useAppNotices } from './hooks/useAppNotices';
export type { UseAppNoticesResult } from './hooks/useAppNotices';
export { useSubmitInquiry } from './hooks/useSubmitInquiry';
export type {
  InquiryData,
  UseSubmitInquiryResult,
} from './hooks/useSubmitInquiry';

export { AppNoticeDetailScreen } from './screens/AppNoticeDetailScreen';
export { AppNoticeScreen } from './screens/AppNoticeScreen';
export { InquiriesScreen } from './screens/InquiriesScreen';
export { PrivacyPolicyScreen } from './screens/PrivacyPolicyScreen';
export { SettingScreen } from './screens/SettingScreen';
export { TermsOfUseScreen } from './screens/TermsOfUseScreen';
export {MockAppSettingRepository} from './data/repositories/MockAppSettingRepository';

export {
  buildAppNoticeForegroundNotification,
  navigateToAppNoticeDetail,
} from './services/appNoticeNavigationService';
export {
  checkVersionUpdate,
  getCurrentAppVersion,
  getMinimumRequiredVersion,
} from './services/appVersionService';
