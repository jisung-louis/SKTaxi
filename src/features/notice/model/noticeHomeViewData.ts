export type NoticeHomeCategoryId =
  | 'all'
  | 'academic'
  | 'scholarship'
  | 'career'
  | 'event'
  | 'facility';

export type NoticeHomeTone = 'blue' | 'purple' | 'orange' | 'pink' | 'gray';

export interface NoticeHomeCategoryDefinition {
  id: NoticeHomeCategoryId;
  label: string;
  repositoryCategory: string;
  sourceCategories: string[];
}

export interface NoticeHomeCategoryChipViewData {
  id: NoticeHomeCategoryId;
  label: string;
  selected: boolean;
}

export interface NoticeHomeBannerViewData {
  actionLabel?: string;
  description: string;
  hasUnread: boolean;
  title: string;
}

export interface NoticeHomeNoticeItemViewData {
  categoryLabel: string;
  categoryTone: NoticeHomeTone;
  dateLabel: string;
  id: string;
  isUnread: boolean;
  title: string;
}

export interface NoticeHomeEmptyStateViewData {
  description: string;
  title: string;
}

export interface NoticeHomeViewData {
  banner: NoticeHomeBannerViewData;
  categoryChips: NoticeHomeCategoryChipViewData[];
  emptyState: NoticeHomeEmptyStateViewData;
  firstUnreadNoticeId?: string;
  items: NoticeHomeNoticeItemViewData[];
  subtitle: string;
  title: string;
}
