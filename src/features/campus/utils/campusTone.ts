import {COLORS} from '@/shared/design-system/tokens';

import type {CampusHighlightTone, CampusNoticeTone} from '../model/campusHome';

export const getNoticeToneColors = (tone: CampusNoticeTone) => {
  switch (tone) {
    case 'blue':
      return {
        backgroundColor: COLORS.accent.blueSoft,
        textColor: COLORS.accent.blue,
      };
    case 'orange':
      return {
        backgroundColor: COLORS.accent.orangeSoft,
        textColor: COLORS.accent.orange,
      };
    case 'purple':
      return {
        backgroundColor: COLORS.accent.purpleSoft,
        textColor: COLORS.accent.purple,
      };
    case 'brand':
    default:
      return {
        backgroundColor: COLORS.brand.primaryTint,
        textColor: COLORS.brand.primaryStrong,
      };
  }
};

export const getHighlightToneColors = (tone: CampusHighlightTone) => {
  switch (tone) {
    case 'orange':
      return {
        backgroundColor: COLORS.accent.orangeSoft,
        textColor: COLORS.accent.orange,
        accentColor: COLORS.accent.orange,
      };
    case 'pink':
      return {
        backgroundColor: COLORS.accent.pinkSoft,
        textColor: COLORS.status.danger,
        accentColor: COLORS.status.danger,
      };
    case 'brand':
      return {
        backgroundColor: COLORS.brand.primaryTint,
        textColor: COLORS.brand.primaryStrong,
        accentColor: COLORS.brand.primary,
      };
    case 'blue':
    default:
      return {
        backgroundColor: COLORS.accent.blueSoft,
        textColor: COLORS.accent.blue,
        accentColor: COLORS.accent.blue,
      };
  }
};
