import type {ComponentProps} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS} from '@/shared/design-system/tokens';

import type {AcademicCalendarEventKind} from './academicCalendarDetailSource';

export interface AcademicCalendarEventTone {
  barColor: string;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: ComponentProps<typeof Icon>['name'];
}

const ACADEMIC_CALENDAR_EVENT_TONES: Record<
  AcademicCalendarEventKind,
  AcademicCalendarEventTone
> = {
  closure: {
    barColor: '#FB7185',
    iconBackgroundColor: '#FFF1F2',
    iconColor: '#F43F5E',
    iconName: 'flag-outline',
  },
  exam: {
    barColor: '#60A5FA',
    iconBackgroundColor: '#FFFBEB',
    iconColor: '#F59E0B',
    iconName: 'construct-outline',
  },
  holiday: {
    barColor: '#A78BFA',
    iconBackgroundColor: '#FFFBEB',
    iconColor: '#F59E0B',
    iconName: 'calendar-outline',
  },
  registration: {
    barColor: '#60A5FA',
    iconBackgroundColor: '#F5F3FF',
    iconColor: '#8B5CF6',
    iconName: 'book-outline',
  },
  semester: {
    barColor: '#34D399',
    iconBackgroundColor: '#EFF6FF',
    iconColor: '#3B82F6',
    iconName: 'flag-outline',
  },
};

export const getAcademicCalendarEventTone = (
  kind: AcademicCalendarEventKind,
) => ACADEMIC_CALENDAR_EVENT_TONES[kind];

export const ACADEMIC_CALENDAR_BADGE_TONE = {
  backgroundColor: '#FFF1F2',
  textColor: '#F43F5E',
};

export const ACADEMIC_CALENDAR_STATUS_TONES = {
  active: {
    backgroundColor: COLORS.brand.primaryTint,
    textColor: COLORS.brand.primaryStrong,
  },
  countdown: {
    backgroundColor: COLORS.background.subtle,
    textColor: COLORS.text.secondary,
  },
  ended: {
    backgroundColor: COLORS.background.subtle,
    textColor: COLORS.text.muted,
  },
} as const;
