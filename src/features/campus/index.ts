export { AcademicCalendarSection } from './components/AcademicCalendarSection';
export { CafeteriaSection } from './components/CafeteriaSection';
export { MonthCalendar } from './components/MonthCalendar';
export { WeekCalendar } from './components/WeekCalendar';

export {
  FirebaseAcademicRepository,
  FirestoreAcademicRepository,
} from './data/repositories/FirebaseAcademicRepository';
export {
  FirebaseCafeteriaRepository,
  FirestoreCafeteriaRepository,
} from './data/repositories/FirebaseCafeteriaRepository';
export type { IAcademicRepository } from './data/repositories/IAcademicRepository';
export type { ICafeteriaRepository } from './data/repositories/ICafeteriaRepository';
export type {ICafeteriaDetailRepository} from './data/repositories/ICafeteriaDetailRepository';
export type {
  ICampusHomeRepository,
} from './data/repositories/ICampusHomeRepository';

export { useAcademicSchedules } from './hooks/useAcademicSchedules';
export type { UseAcademicSchedulesResult } from './hooks/useAcademicSchedules';
export {useCafeteriaDetailData} from './hooks/useCafeteriaDetailData';
export { useCafeteriaMenu } from './hooks/useCafeteriaMenu';
export type {
  ProcessedMenu,
  UseCafeteriaMenuResult,
} from './hooks/useCafeteriaMenu';
export { useCampusHomeRepository } from './hooks/useCampusHomeRepository';
export { useCampusHomeViewData } from './hooks/useCampusHomeViewData';
export type {
  UseCampusHomeViewDataResult,
} from './hooks/useCampusHomeViewData';

export {
  MockCampusHomeRepository,
  mockCampusHomeRepository,
} from './mocks/MockCampusHomeRepository';
export {MockCafeteriaDetailRepository} from './data/repositories/MockCafeteriaDetailRepository';
export {
  createCrossBoundaryCampusHomeViewData,
  createDefaultCampusHomeViewData,
  createNoCourseCampusHomeViewData,
} from './mocks/campusHomeViewData';

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
  CampusTaxiPartyViewData,
  CampusTimetableEmptyStateViewData,
  CampusTimetablePeriodViewData,
  CampusTimetableSessionViewData,
  CampusTimetableStatusViewData,
} from './model/campusHome';
export {
  CAFETERIA_CATEGORIES,
  getAllMenuItems,
  getMenuForDate,
} from './model/cafeteria';
export type {
  CafeteriaCategoryId,
  CafeteriaCategorySource,
  CafeteriaDetailSource,
  CafeteriaMenuBadgeSource,
  CafeteriaMenuItemSource,
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

export { AcademicCalendarDetailScreen } from './screens/AcademicCalendarDetailScreen';
export { CafeteriaDetailScreen } from './screens/CafeteriaDetailScreen';
