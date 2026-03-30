import type {CampusBannerViewData} from './campusHomeBanner';

export type CampusNoticeTone = 'brand' | 'blue' | 'orange' | 'purple';

export type CampusHighlightTone = 'brand' | 'blue' | 'orange' | 'pink';

export interface CampusNoticeItemViewData {
  id: string;
  categoryLabel: string;
  commentCount: number;
  likeCount: number;
  publishedAtLabel: string;
  title: string;
  tone: CampusNoticeTone;
  viewCount: number;
}

export interface CampusTimetableStatusViewData {
  label: string;
  tone: CampusHighlightTone;
}

export interface CampusTimetablePeriodViewData {
  id: string;
  periodNumber: number;
  periodLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
}

export interface CampusTimetableSessionViewData {
  id: string;
  startPeriod: number;
  endPeriod: number;
  title: string;
  instructorLabel?: string;
  roomLabel?: string;
  tone?: Extract<CampusHighlightTone, 'blue' | 'orange'>;
  status?: CampusTimetableStatusViewData;
  isCurrent?: boolean;
}

export interface CampusTimetableEmptyStateViewData {
  title: string;
  description: string;
}

export interface CampusCafeteriaRecommendedMenuViewData {
  categoryCode: string;
  categoryLabel: string;
  id: string;
  likeCountLabel: string;
  title: string;
}

export interface CampusAcademicEventBadgeViewData {
  label: string;
  tone: CampusHighlightTone;
}

export interface CampusAcademicEventViewData {
  countdownLabel: string;
  dateBoxBackgroundColor: string;
  dateBoxTextColor: string;
  id: string;
  title: string;
  dateRangeLabel: string;
  badge?: CampusAcademicEventBadgeViewData;
}

export interface CampusHomeViewData {
  banners: CampusBannerViewData[];
  notices: {
    items: CampusNoticeItemViewData[];
  };
  timetable: {
    dateLabel: string;
    periods: CampusTimetablePeriodViewData[];
    sessions: CampusTimetableSessionViewData[];
    collapsedVisibleCount: number;
    emptyState?: CampusTimetableEmptyStateViewData;
  };
  cafeteria: {
    recommendedMenus: CampusCafeteriaRecommendedMenuViewData[];
  };
  academicCalendar: {
    items: CampusAcademicEventViewData[];
  };
}
