import type {ContentDetailBadgeTone} from '@/shared/types/contentDetailViewData';

import type {NoticeCategory} from './constants';

export type NoticeHomeCategoryId = NoticeCategory;

export type NoticeHomeTone = ContentDetailBadgeTone;

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
  authorLabel: string;
  bookmarkCount: number;
  categoryLabel: string;
  categoryTone: NoticeHomeTone;
  commentCount: number;
  id: string;
  isBookmarked: boolean;
  isCommentedByMe: boolean;
  isLiked: boolean;
  isUnread: boolean;
  likeCount: number;
  thumbnailUrl?: string;
  timeLabel: string;
  title: string;
  viewCount: number;
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
