import type {CampusStackParamList} from '@/app/navigation/types';
import {COLORS} from '@/shared/design-system/tokens';

export type CampusHomeQuickMenuItem = {
  label: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  routeName: keyof CampusStackParamList;
};

export const CAMPUS_HOME_QUICK_MENU_ITEMS: readonly CampusHomeQuickMenuItem[] = [
  {
    label: '시간표',
    icon: 'calendar-outline',
    iconColor: COLORS.accent.purple,
    backgroundColor: COLORS.accent.purpleSoft,
    routeName: 'TimetableDetail',
  },
  {
    label: '학식',
    icon: 'restaurant-outline',
    iconColor: COLORS.accent.orange,
    backgroundColor: COLORS.accent.orangeSoft,
    routeName: 'CafeteriaDetail',
  },
  {
    label: '학사일정',
    icon: 'calendar-clear-outline',
    iconColor: COLORS.accent.blue,
    backgroundColor: COLORS.accent.blueSoft,
    routeName: 'AcademicCalendarDetail',
  },
  {
    label: '설정',
    icon: 'settings-outline',
    iconColor: COLORS.text.secondary,
    backgroundColor: COLORS.background.subtle,
    routeName: 'Setting',
  },
] as const;

export const CAMPUS_HOME_ACTION_LABELS = {
  notices: '전체보기',
  timetable: '시간표',
  taxi: '전체보기',
  cafeteria: '학식 전체 보기',
  academicCalendar: '학사일정 전체보기',
} as const;
