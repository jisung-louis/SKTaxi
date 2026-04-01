import {COLORS} from '@/shared/design-system/tokens';

import type {TimetableCourseToneId} from './timetablePrimitives';

export const TIMETABLE_COURSE_TONES: Record<
  TimetableCourseToneId,
  {
    accent: string;
    pillBackground: string;
    softBackground: string;
    text: string;
  }
> = {
  green: {
    accent: '#4ADE80',
    pillBackground: '#DCFCE7',
    softBackground: 'rgba(74, 222, 128, 0.15)',
    text: '#4ADE80',
  },
  blue: {
    accent: '#60A5FA',
    pillBackground: '#DBEAFE',
    softBackground: 'rgba(96, 165, 250, 0.15)',
    text: '#60A5FA',
  },
  pink: {
    accent: '#F472B6',
    pillBackground: '#FCE7F3',
    softBackground: 'rgba(244, 114, 182, 0.15)',
    text: '#F472B6',
  },
  yellow: {
    accent: '#FBBF24',
    pillBackground: '#FEF3C7',
    softBackground: 'rgba(251, 191, 36, 0.15)',
    text: '#FBBF24',
  },
  purple: {
    accent: '#A78BFA',
    pillBackground: '#F3E8FF',
    softBackground: 'rgba(167, 139, 250, 0.15)',
    text: '#A78BFA',
  },
  teal: {
    accent: '#34D399',
    pillBackground: '#D1FAE5',
    softBackground: 'rgba(52, 211, 153, 0.15)',
    text: '#34D399',
  },
  orange: {
    accent: '#FB923C',
    pillBackground: '#FFEDD5',
    softBackground: 'rgba(251, 146, 60, 0.15)',
    text: '#FB923C',
  },
  red: {
    accent: '#F87171',
    pillBackground: '#FEE2E2',
    softBackground: 'rgba(248, 113, 113, 0.15)',
    text: '#F87171',
  },
};

export const TIMETABLE_TODAY_EMPTY_DOT_COLOR = COLORS.border.default;
