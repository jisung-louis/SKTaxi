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

export { useAcademicSchedules } from './hooks/useAcademicSchedules';
export type { UseAcademicSchedulesResult } from './hooks/useAcademicSchedules';
export { useCafeteriaMenu } from './hooks/useCafeteriaMenu';
export type {
  ProcessedMenu,
  UseCafeteriaMenuResult,
} from './hooks/useCafeteriaMenu';

export type {
  AcademicSchedule,
  AcademicScheduleWithColor,
  CalendarView,
  ScheduleMessage,
} from './model/academic';
export {
  CAFETERIA_CATEGORIES,
  getAllMenuItems,
  getMenuForDate,
} from './model/cafeteria';
export type {
  DailyMenu,
  MenuCategory,
  MenuItems,
  WeeklyMenu,
} from './model/cafeteria';

export { AcademicCalendarDetailScreen } from './screens/AcademicCalendarDetailScreen';
export { CafeteriaDetailScreen } from './screens/CafeteriaDetailScreen';
