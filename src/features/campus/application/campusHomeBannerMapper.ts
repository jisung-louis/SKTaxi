import {COLORS} from '@/shared/design-system/tokens';

import type {
  CampusBannerPalette,
  CampusBannerPaletteKey,
  CampusBannerSourceData,
  CampusBannerViewData,
} from '../model/campusHomeBanner';

const normalizeLabel = (value: string) => value.trim();

const BANNER_PALETTE_MAP: Record<CampusBannerPaletteKey, CampusBannerPalette> =
  {
    GREEN: {
      accent: '#16A34A',
      backgroundGradient: ['#F0FDF4', '#DCFCE7'],
      badgeBackground: 'rgba(22, 163, 74, 0.12)',
      badgeText: '#16A34A',
      buttonBackground: '#16A34A',
      buttonText: COLORS.text.inverse,
    },
    BLUE: {
      accent: '#2563EB',
      backgroundGradient: ['#EFF6FF', '#DBEAFE'],
      badgeBackground: 'rgba(37, 99, 235, 0.12)',
      badgeText: '#2563EB',
      buttonBackground: '#2563EB',
      buttonText: COLORS.text.inverse,
    },
    PURPLE: {
      accent: '#7C3AED',
      backgroundGradient: ['#FAF5FF', '#EDE9FE'],
      badgeBackground: 'rgba(124, 58, 237, 0.12)',
      badgeText: '#7C3AED',
      buttonBackground: '#7C3AED',
      buttonText: COLORS.text.inverse,
    },
    RED: {
      accent: '#EF4444',
      backgroundGradient: ['#FEF2F2', '#FEE2E2'],
      badgeBackground: 'rgba(239, 68, 68, 0.12)',
      badgeText: '#DC2626',
      buttonBackground: '#EF4444',
      buttonText: COLORS.text.inverse,
    },
    YELLOW: {
      accent: '#D97706',
      backgroundGradient: ['#FFFBEB', '#FEF3C7'],
      badgeBackground: 'rgba(234, 179, 8, 0.18)',
      badgeText: '#A16207',
      buttonBackground: '#EAB308',
      buttonText: COLORS.text.primary,
    },
  };

const getFallbackImageUrl = ({
  action,
  paletteKey,
}: Pick<CampusBannerSourceData, 'action' | 'paletteKey'>) => {
  if (action.type === 'inApp') {
    switch (action.target) {
      case 'TAXI_MAIN':
        return 'wireframe://taxi';
      case 'NOTICE_MAIN':
        return 'wireframe://notice';
      case 'TIMETABLE_DETAIL':
        return 'wireframe://timetable';
      case 'CAFETERIA_DETAIL':
        return 'wireframe://timetable';
      case 'ACADEMIC_CALENDAR_DETAIL':
        return 'wireframe://notice';
      default:
        break;
    }
  }

  switch (paletteKey) {
    case 'GREEN':
      return 'wireframe://taxi';
    case 'BLUE':
    case 'RED':
      return 'wireframe://notice';
    case 'PURPLE':
    case 'YELLOW':
    default:
      return 'wireframe://timetable';
  }
};

export const mapCampusBannerSourceToViewData = (
  source: CampusBannerSourceData,
): CampusBannerViewData => ({
  action: source.action,
  badgeLabel: normalizeLabel(source.badgeLabel),
  buttonLabel: normalizeLabel(source.buttonLabel),
  descriptionLabel: normalizeLabel(source.descriptionLabel),
  id: source.id,
  imageUrl:
    source.imageUrl.trim().length > 0
      ? source.imageUrl.trim()
      : getFallbackImageUrl(source),
  palette: {
    ...BANNER_PALETTE_MAP[source.paletteKey],
    backgroundGradient: [
      ...BANNER_PALETTE_MAP[source.paletteKey].backgroundGradient,
    ] as [string, string],
  },
  titleLabel: normalizeLabel(source.titleLabel),
});
