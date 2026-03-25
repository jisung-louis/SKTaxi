export type {IAcademicRepository} from './data/repositories/IAcademicRepository';
export type {ICafeteriaRepository} from './data/repositories/ICafeteriaRepository';

export {useAcademicSchedules} from './hooks/useAcademicSchedules';
export type {UseAcademicSchedulesResult} from './hooks/useAcademicSchedules';
export {useCafeteriaDetailData} from './hooks/useCafeteriaDetailData';
export {useCafeteriaMenu} from './hooks/useCafeteriaMenu';
export type {
  ProcessedMenu,
  UseCafeteriaMenuResult,
} from './hooks/useCafeteriaMenu';
export {useCampusHomeViewData} from './hooks/useCampusHomeViewData';
export type {UseCampusHomeViewDataResult} from './hooks/useCampusHomeViewData';
export type {
  CampusBannerPalette,
  CampusBannerSourceData,
  CampusBannerViewData,
} from './model/campusHomeBanner';

export type {
  AcademicSchedule,
  AcademicScheduleWithColor,
  CalendarView,
  ScheduleMessage,
} from './model/academic';
export type {
  CampusAcademicEventBadgeViewData,
  CampusAcademicEventViewData,
  CampusCafeteriaRecommendedMenuViewData,
  CampusHighlightTone,
  CampusHomeViewData,
  CampusNoticeItemViewData,
  CampusNoticeTone,
  CampusTimetableEmptyStateViewData,
  CampusTimetablePeriodViewData,
  CampusTimetableSessionViewData,
  CampusTimetableStatusViewData,
} from './model/campusHome';
export {
  CAFETERIA_CATEGORIES,
  formatLocalDateKey,
  getAllMenuItems,
  getMenuForDate,
} from './model/cafeteria';
export type {
  CafeteriaCategoryId,
  CafeteriaMenuBadgeTone,
} from './model/cafeteriaDetailSource';
export type {
  CafeteriaCategorySectionViewData,
  CafeteriaDetailScreenViewData,
  CafeteriaMenuItemViewData,
} from './model/cafeteriaDetailViewData';
export type {
  DailyMenu,
  MenuCategory,
  MenuItems,
  WeeklyMenu,
} from './model/cafeteria';

export {AcademicCalendarDetailScreen} from './screens/AcademicCalendarDetailScreen';
export {CafeteriaDetailScreen} from './screens/CafeteriaDetailScreen';
export {CampusScreen} from './screens/CampusScreen';
