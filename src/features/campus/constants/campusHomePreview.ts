import type {CampusStackParamList} from '@/app/navigation/types';
import {V2_COLORS} from '@/shared/design-system/tokens';

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
    iconColor: V2_COLORS.accent.purple,
    backgroundColor: V2_COLORS.accent.purpleSoft,
    routeName: 'TimetableDetail',
  },
  {
    label: '학식',
    icon: 'restaurant-outline',
    iconColor: V2_COLORS.accent.orange,
    backgroundColor: V2_COLORS.accent.orangeSoft,
    routeName: 'CafeteriaDetail',
  },
  {
    label: '학사일정',
    icon: 'calendar-clear-outline',
    iconColor: V2_COLORS.accent.blue,
    backgroundColor: V2_COLORS.accent.blueSoft,
    routeName: 'AcademicCalendarDetail',
  },
  {
    label: '설정',
    icon: 'settings-outline',
    iconColor: V2_COLORS.text.secondary,
    backgroundColor: V2_COLORS.background.subtle,
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
