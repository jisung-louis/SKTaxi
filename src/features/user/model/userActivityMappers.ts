import {COLORS} from '@/shared/design-system/tokens';

import type {
  BookmarksSource,
  TaxiHistoryEntrySource,
  TaxiHistorySource,
  UserNoticeBookmarkItemSource,
  UserPostListItemSource,
} from './userActivitySource';
import type {
  BookmarksScreenViewData,
  MyPostsScreenViewData,
  TaxiHistoryEntryViewData,
  TaxiHistoryScreenViewData,
  UserNoticeBookmarkItemViewData,
  UserPostListItemViewData,
} from './userActivityViewData';

const getPostToneStyles = (tone: UserPostListItemSource['categoryTone']) => {
  switch (tone) {
    case 'green':
      return {
        backgroundColor: COLORS.brand.primaryTint,
        textColor: COLORS.brand.primaryStrong,
      };
    case 'orange':
      return {
        backgroundColor: COLORS.accent.orangeSoft,
        textColor: COLORS.accent.orange,
      };
    case 'blue':
    default:
      return {
        backgroundColor: COLORS.accent.blueSoft,
        textColor: COLORS.accent.blue,
      };
  }
};

const getNoticeToneStyles = (tone: UserNoticeBookmarkItemSource['categoryTone']) => {
  switch (tone) {
    case 'yellow':
      return {
        backgroundColor: '#FEFCE8',
        textColor: '#CA8A04',
      };
    case 'pink':
      return {
        backgroundColor: COLORS.accent.pinkSoft,
        textColor: COLORS.accent.pink,
      };
    case 'blue':
    default:
      return {
        backgroundColor: COLORS.accent.blueSoft,
        textColor: COLORS.accent.blue,
      };
  }
};

const getTaxiPillStyles = (
  tone: TaxiHistoryEntrySource['statusTone'] | TaxiHistoryEntrySource['roleTone'],
) => {
  switch (tone) {
    case 'red':
      return {
        backgroundColor: '#FEF2F2',
        textColor: '#EF4444',
      };
    case 'purple':
      return {
        backgroundColor: COLORS.accent.purpleSoft,
        textColor: '#A855F7',
      };
    case 'orange':
      return {
        backgroundColor: COLORS.accent.orangeSoft,
        textColor: '#F97316',
      };
    case 'green':
    default:
      return {
        backgroundColor: COLORS.brand.primaryTint,
        textColor: COLORS.brand.primaryStrong,
      };
  }
};

export const toUserPostItemViewData = (
  item: UserPostListItemSource,
): UserPostListItemViewData => {
  const toneStyles = getPostToneStyles(item.categoryTone);

  return {
    bookmarkCountLabel: `${item.bookmarkCount}`,
    bookmarkHighlighted: item.bookmarkCount > 0,
    categoryLabel: item.categoryLabel,
    categoryPillColor: toneStyles.backgroundColor,
    categoryTextColor: toneStyles.textColor,
    commentCountLabel: `${item.commentCount}`,
    dateLabel: item.dateLabel,
    excerpt: item.excerpt,
    likeCountLabel: `${item.likeCount}`,
    postId: item.postId,
    title: item.title,
  };
};

export const toNoticeBookmarkItemViewData = (
  item: UserNoticeBookmarkItemSource,
): UserNoticeBookmarkItemViewData => {
  const toneStyles = getNoticeToneStyles(item.categoryTone);

  return {
    categoryLabel: item.categoryLabel,
    categoryPillColor: toneStyles.backgroundColor,
    categoryTextColor: toneStyles.textColor,
    dateLabel: item.dateLabel,
    excerpt: item.excerpt,
    noticeId: item.noticeId,
    title: item.title,
  };
};

export const toMyPostsViewData = (
  items: UserPostListItemSource[],
): MyPostsScreenViewData => ({
  countLabel: `${items.length}개`,
  items: items.map(toUserPostItemViewData),
  title: '내가 쓴 글',
});

export const toBookmarksViewData = (
  source: BookmarksSource,
): BookmarksScreenViewData => ({
  communityCountLabel: `${source.communityItems.length}`,
  communityItems: source.communityItems.map(toUserPostItemViewData),
  noticeCountLabel: `${source.noticeItems.length}`,
  noticeItems: source.noticeItems.map(toNoticeBookmarkItemViewData),
  title: '북마크',
});

const toTaxiEntryViewData = (
  entry: TaxiHistoryEntrySource,
): TaxiHistoryEntryViewData => {
  const statusStyles = getTaxiPillStyles(entry.statusTone);
  const roleStyles = getTaxiPillStyles(entry.roleTone);

  return {
    arrivalLabel: entry.arrivalLabel,
    dateTimeLabel: entry.dateTimeLabel,
    departureLabel: entry.departureLabel,
    id: entry.id,
    passengerCountLabel: entry.passengerCountLabel,
    paymentLabel: entry.paymentLabel,
    paymentMuted: entry.paymentLabel === '-',
    roleBackgroundColor: roleStyles.backgroundColor,
    roleLabel: entry.roleLabel,
    roleTextColor: roleStyles.textColor,
    statusBackgroundColor: statusStyles.backgroundColor,
    statusLabel: entry.statusLabel,
    statusTextColor: statusStyles.textColor,
  };
};

export const toTaxiHistoryViewData = (
  source: TaxiHistorySource,
): TaxiHistoryScreenViewData => ({
  entries: source.entries.map(toTaxiEntryViewData),
  summary: {
    completedRideCountLabel: source.summary.completedRideCountLabel,
    savedFareLabel: source.summary.savedFareLabel,
    subtitleCompleted: '완료된 이용',
    subtitleSaved: '절약한 택시비',
    title: '누적 이용 현황',
  },
  title: '택시 이용 내역',
});
