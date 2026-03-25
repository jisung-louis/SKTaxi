export type AcademicCalendarDetailViewMode = 'month' | 'week';

export interface AcademicCalendarDayCellViewData {
  id: string;
  isoDate?: string;
  dayNumberLabel?: string;
  weekdayLabel?: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  tone: 'default' | 'saturday' | 'sunday';
}

export interface AcademicCalendarEventBarViewData {
  id: string;
  eventId: string;
  title: string;
  leftColumn: number;
  rowIndex: number;
  span: number;
  barColor: string;
  opacity: number;
  roundedEnd: boolean;
  roundedStart: boolean;
}

export interface AcademicCalendarMonthWeekViewData {
  id: string;
  bars: AcademicCalendarEventBarViewData[];
  days: AcademicCalendarDayCellViewData[];
  laneCount: number;
}

export interface AcademicCalendarMonthViewData {
  weeks: AcademicCalendarMonthWeekViewData[];
}

export interface AcademicCalendarWeekViewData {
  bars: AcademicCalendarEventBarViewData[];
  days: AcademicCalendarDayCellViewData[];
  laneCount: number;
  weekLabel: string;
}

export interface AcademicCalendarListItemViewData {
  dateLabel: string;
  eventId: string;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  importantLabel?: string;
  statusBackgroundColor: string;
  statusLabel: string;
  statusTextColor: string;
  title: string;
}

export interface AcademicCalendarDetailScreenViewData {
  activeMode: AcademicCalendarDetailViewMode;
  countLabel: string;
  currentLabel: string;
  currentSubLabel?: string;
  listItems: AcademicCalendarListItemViewData[];
  listTitle: string;
  monthView: AcademicCalendarMonthViewData;
  weekView: AcademicCalendarWeekViewData;
}
