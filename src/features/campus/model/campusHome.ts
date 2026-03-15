export type CampusNoticeTone = 'brand' | 'blue' | 'orange' | 'purple';

export type CampusHighlightTone = 'brand' | 'blue' | 'orange' | 'pink';

export interface CampusNoticeItemViewData {
  id: string;
  categoryLabel: string;
  publishedAtLabel: string;
  title: string;
  tone: CampusNoticeTone;
}

export interface CampusTimetableStatusViewData {
  label: string;
  tone: CampusHighlightTone;
}

export interface CampusTimetablePeriodViewData {
  id: string;
  periodLabel: string;
  startTimeLabel: string;
  title?: string;
  instructorLabel?: string;
  roomLabel?: string;
  tone?: Extract<CampusHighlightTone, 'blue' | 'orange'>;
  status?: CampusTimetableStatusViewData;
  isCurrent?: boolean;
  isEmpty?: boolean;
}

export interface CampusTimetableEmptyStateViewData {
  title: string;
  description: string;
}

export interface CampusTaxiPartyViewData {
  id: string;
  routeLabel: string;
  departureTimeLabel: string;
  seatStatusLabel: string;
}

export interface CampusCafeteriaFeaturedMenuViewData {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
}

export interface CampusAcademicEventBadgeViewData {
  label: string;
  tone: CampusHighlightTone;
  placement?: 'inline' | 'trailing';
}

export interface CampusAcademicEventViewData {
  id: string;
  monthLabel: string;
  dayLabel: string;
  title: string;
  dateRangeLabel: string;
  badge?: CampusAcademicEventBadgeViewData;
}

export interface CampusHomeViewData {
  notices: {
    items: CampusNoticeItemViewData[];
  };
  timetable: {
    dateLabel: string;
    periods: CampusTimetablePeriodViewData[];
    collapsedVisibleCount: number;
    emptyState?: CampusTimetableEmptyStateViewData;
  };
  taxi: {
    items: CampusTaxiPartyViewData[];
  };
  cafeteria: {
    featuredMenu: CampusCafeteriaFeaturedMenuViewData | null;
  };
  academicCalendar: {
    items: CampusAcademicEventViewData[];
  };
}
