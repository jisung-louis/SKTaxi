export type UserPostTone = 'blue' | 'green' | 'orange';
export type UserNoticeTone = 'blue' | 'yellow' | 'pink';
export type TaxiRoleTone = 'orange' | 'purple';
export type TaxiStatusTone = 'green' | 'red';

export interface UserPostListItemSource {
  bookmarkCount: number;
  categoryLabel: string;
  categoryTone: UserPostTone;
  commentCount: number;
  dateLabel: string;
  excerpt: string;
  likeCount: number;
  postId: string;
  title: string;
}

export interface UserNoticeBookmarkItemSource {
  categoryLabel: string;
  categoryTone: UserNoticeTone;
  dateLabel: string;
  excerpt: string;
  noticeId: string;
  title: string;
}

export interface BookmarksSource {
  communityItems: UserPostListItemSource[];
  noticeItems: UserNoticeBookmarkItemSource[];
}

export interface TaxiHistorySummarySource {
  completedRideCountLabel: string;
  savedFareLabel: string;
}

export interface TaxiHistoryEntrySource {
  arrivalLabel: string;
  dateTimeLabel: string;
  departureLabel: string;
  id: string;
  passengerCountLabel: string;
  paymentLabel: string;
  roleLabel: string;
  roleTone: TaxiRoleTone;
  statusLabel: string;
  statusTone: TaxiStatusTone;
}

export interface TaxiHistorySource {
  entries: TaxiHistoryEntrySource[];
  summary: TaxiHistorySummarySource;
}
