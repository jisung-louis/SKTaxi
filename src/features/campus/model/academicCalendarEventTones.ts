import {COLORS} from '@/shared/design-system/tokens';

export interface AcademicCalendarEventColorTone {
  accentColor: string;
  barColor: string;
  barTextColor: string;
}

export const ACADEMIC_CALENDAR_EVENT_COLOR_CYCLE: readonly AcademicCalendarEventColorTone[] =
  [
    {
      accentColor: '#DBEAFE',
      barColor: '#BFDBFE',
      barTextColor: '#1D4ED8',
    },
    {
      accentColor: '#FFEDD5',
      barColor: '#FED7AA',
      barTextColor: '#C2410C',
    },
    {
      accentColor: '#FCE7F3',
      barColor: '#FBCFE8',
      barTextColor: '#BE185D',
    },
    {
      accentColor: COLORS.brand.primarySoft,
      barColor: '#BBF7D0',
      barTextColor: COLORS.brand.primaryStrong,
    },
    {
      accentColor: '#F3E8FF',
      barColor: '#E9D5FF',
      barTextColor: '#7E22CE',
    },
    {
      accentColor: '#FEF3C7',
      barColor: '#FDE68A',
      barTextColor: '#A16207',
    },
    {
      accentColor: '#CCFBF1',
      barColor: '#99F6E4',
      barTextColor: '#0F766E',
    },
    {
      accentColor: '#FEE2E2',
      barColor: '#FECACA',
      barTextColor: '#B91C1C',
    },
  ] as const;

export const getAcademicCalendarEventColorTone = (
  index: number,
): AcademicCalendarEventColorTone =>
  ACADEMIC_CALENDAR_EVENT_COLOR_CYCLE[
    ((index % ACADEMIC_CALENDAR_EVENT_COLOR_CYCLE.length) +
      ACADEMIC_CALENDAR_EVENT_COLOR_CYCLE.length) %
      ACADEMIC_CALENDAR_EVENT_COLOR_CYCLE.length
  ];

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
