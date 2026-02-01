// SKTaxi: Notice 관련 훅 통합 내보내기

export { useNotices } from './useNotices';
export type { UseNoticesResult } from './useNotices';

export { useNotice } from './useNotice';
export type { UseNoticeResult } from './useNotice';

export { useNoticeComments } from './useNoticeComments';
export type { UseNoticeCommentsResult } from './useNoticeComments';

export { useNoticeLike } from './useNoticeLike';
export type { UseNoticeLikeResult } from './useNoticeLike';

export { useRecentNotices } from './useRecentNotices';
export type { UseRecentNoticesResult } from './useRecentNotices';

export { useNoticeSettings } from './useNoticeSettings';
export type { NoticeSettingsState, NoticeSettingsDetail } from './useNoticeSettings';

// Repository 인터페이스에서 Notice 타입 re-export
export type { Notice, ReadStatusMap, NoticeCommentTreeNode } from '../../repositories/interfaces/INoticeRepository';
