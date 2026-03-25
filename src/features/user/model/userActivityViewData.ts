export interface UserPostListItemViewData {
  bookmarkCountLabel: string;
  bookmarkHighlighted: boolean;
  categoryLabel: string;
  categoryPillColor: string;
  categoryTextColor: string;
  commentCountLabel: string;
  dateLabel: string;
  excerpt: string;
  likeCountLabel: string;
  postId: string;
  title: string;
}

export interface UserNoticeBookmarkItemViewData {
  categoryLabel: string;
  categoryPillColor: string;
  categoryTextColor: string;
  dateLabel: string;
  excerpt: string;
  noticeId: string;
  title: string;
}

export interface MyPostsScreenViewData {
  countLabel: string;
  items: UserPostListItemViewData[];
  title: string;
}

export interface BookmarksScreenViewData {
  communityCountLabel: string;
  communityItems: UserPostListItemViewData[];
  noticeCountLabel: string;
  noticeItems: UserNoticeBookmarkItemViewData[];
  title: string;
}

export interface TaxiHistorySummaryViewData {
  completedRideCountLabel: string;
  savedFareLabel: string;
  subtitleCompleted: string;
  subtitleSaved: string;
  title: string;
}

export interface TaxiHistoryEntryViewData {
  arrivalLabel: string;
  dateTimeLabel: string;
  departureLabel: string;
  id: string;
  passengerCountLabel: string;
  paymentLabel: string;
  paymentMuted: boolean;
  roleBackgroundColor: string;
  roleLabel: string;
  roleTextColor: string;
  statusBackgroundColor: string;
  statusLabel: string;
  statusTextColor: string;
}

export interface TaxiHistoryScreenViewData {
  entries: TaxiHistoryEntryViewData[];
  summary: TaxiHistorySummaryViewData;
  title: string;
}
