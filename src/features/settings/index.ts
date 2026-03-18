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
export type {ILegalDocumentRepository} from './data/repositories/ILegalDocumentRepository';
export type {
  IInquiryFormRepository,
  SubmitInquiryFormPayload,
} from './data/repositories/IInquiryFormRepository';
export type {
  CreateInquiryData,
  Inquiry,
  InquiryType,
  IInquiryRepository,
} from './data/repositories/IInquiryRepository';

export {useAppSettingData} from './hooks/useAppSettingData';
export {useAppNoticeFeedData} from './hooks/useAppNoticeFeedData';
export {useLegalDocumentData} from './hooks/useLegalDocumentData';
export {useInquiryFormData} from './hooks/useInquiryFormData';
export { useSubmitInquiry } from './hooks/useSubmitInquiry';
export type {
  InquiryData,
  UseSubmitInquiryResult,
} from './hooks/useSubmitInquiry';

export { AppNoticeDetailScreen } from './screens/AppNoticeDetailScreen';
export { InquiriesScreen } from './screens/InquiriesScreen';
export { LegalDocumentScreen } from './screens/LegalDocumentScreen';
export { PrivacyPolicyScreen } from './screens/PrivacyPolicyScreen';
export { SettingScreen } from './screens/SettingScreen';
export { TermsOfUseScreen } from './screens/TermsOfUseScreen';
export { AppNoticeFeedList } from './components/AppNoticeFeedList';
export {MockLegalDocumentRepository} from './data/repositories/MockLegalDocumentRepository';
export {MockInquiryFormRepository} from './data/repositories/MockInquiryFormRepository';

export type {
  InquiryFormTypeKey,
} from './model/inquiryFormSource';
export type {
  InquiryFormScreenViewData,
  InquiryTypeOptionViewData,
} from './model/inquiryFormViewData';
export type {
  LegalDocumentBannerIconKey,
  LegalDocumentBannerLineSource,
  LegalDocumentBannerLineTone,
  LegalDocumentBannerTone,
  LegalDocumentKey,
  LegalDocumentSectionSource,
  LegalDocumentSource,
} from './model/legalDocumentSource';
export type {
  LegalDocumentBannerLineViewData,
  LegalDocumentBannerViewData,
  LegalDocumentScreenViewData,
  LegalDocumentSectionViewData,
} from './model/legalDocumentViewData';

export {
  buildAppNoticeForegroundNotification,
  navigateToAppNoticeDetail,
} from './services/appNoticeNavigationService';
export {
  checkVersionUpdate,
  getCurrentAppVersion,
  getMinimumRequiredVersion,
} from './services/appVersionService';
