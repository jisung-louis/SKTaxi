export { NoticeSettingsPanel } from './components';

export {
  FirebaseNoticeRepository,
  FirestoreNoticeRepository,
} from './data/repositories/FirebaseNoticeRepository';
export type {
  INoticeRepository,
  NoticeListPage,
} from './data/repositories/INoticeRepository';

export { useNotice } from './hooks/useNotice';
export type { UseNoticeResult } from './hooks/useNotice';
export { useNoticeComments } from './hooks/useNoticeComments';
export type { UseNoticeCommentsResult } from './hooks/useNoticeComments';
export { useNoticeDetail } from './hooks/useNoticeDetail';
export { useNoticeLike } from './hooks/useNoticeLike';
export type { UseNoticeLikeResult } from './hooks/useNoticeLike';
export { useNoticeReadState } from './hooks/useNoticeReadState';
export type { UseNoticeReadStateResult } from './hooks/useNoticeReadState';
export { useNoticeRepository } from './hooks/useNoticeRepository';
export { useNoticeSettings } from './hooks/useNoticeSettings';
export type {
  NoticeSettingsDetail,
  NoticeSettingsState,
} from './hooks/useNoticeSettings';
export { useNotices } from './hooks/useNotices';
export type { UseNoticesResult } from './hooks/useNotices';
export { useRecentNotices } from './hooks/useRecentNotices';
export type { UseRecentNoticesResult } from './hooks/useRecentNotices';

export type {
  Comment,
  CommentFormData,
  Notice,
  NoticeAttachment,
  NoticeComment,
  NoticeCommentFormData,
  NoticeCommentTreeNode,
  NoticeFilterOptions,
  NoticeForegroundNotificationPayload,
  ReadStatusMap,
} from './model/types';
export type { NoticeStackParamList } from './model/navigation';
export type { NoticeCategory } from './model/constants';

export { NoticeDetailScreen } from './screens/NoticeDetailScreen';
export { default as NoticeDetailWebViewScreen } from './screens/NoticeDetailWebViewScreen';
export { NoticeScreen } from './screens/NoticeScreen';

export {
  getCategorySettingKey,
  NOTICE_CATEGORIES,
} from './model/constants';
export {
  countUnreadNotices,
  formatNoticePostedAt,
  getUnreadNoticeBannerText,
  isNoticeRead,
  normalizeNoticeHtml,
  toNoticeTimestampMillis,
} from './model/selectors';
export {
  buildNoticeForegroundNotification,
  buildNoticePushForegroundNotification,
  navigateToNoticeDetail,
  toNoticeSubviewUrl,
} from './services/noticeNavigationService';
export {
  getNoticeIdsToMarkAllAsRead,
  incrementNoticeDetailView,
  resolveNoticeReadStatus,
  shouldPersistNoticeReadState,
} from './services/noticeReadStateService';
