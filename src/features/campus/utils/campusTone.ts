import {V2_COLORS} from '@/shared/design-system/tokens';

import type {CampusHighlightTone, CampusNoticeTone} from '../model/campusHome';

export const getNoticeToneColors = (tone: CampusNoticeTone) => {
  switch (tone) {
    case 'blue':
      return {
        backgroundColor: V2_COLORS.accent.blueSoft,
        textColor: V2_COLORS.accent.blue,
      };
    case 'orange':
      return {
        backgroundColor: V2_COLORS.accent.orangeSoft,
        textColor: V2_COLORS.accent.orange,
      };
    case 'purple':
      return {
        backgroundColor: V2_COLORS.accent.purpleSoft,
        textColor: V2_COLORS.accent.purple,
      };
    case 'brand':
    default:
      return {
        backgroundColor: V2_COLORS.brand.primaryTint,
        textColor: V2_COLORS.brand.primaryStrong,
      };
  }
};

export const getHighlightToneColors = (tone: CampusHighlightTone) => {
  switch (tone) {
    case 'orange':
      return {
        backgroundColor: V2_COLORS.accent.orangeSoft,
        textColor: V2_COLORS.accent.orange,
        accentColor: V2_COLORS.accent.orange,
      };
    case 'pink':
      return {
        backgroundColor: V2_COLORS.accent.pinkSoft,
        textColor: V2_COLORS.status.danger,
        accentColor: V2_COLORS.status.danger,
      };
    case 'brand':
      return {
        backgroundColor: V2_COLORS.brand.primaryTint,
        textColor: V2_COLORS.brand.primaryStrong,
        accentColor: V2_COLORS.brand.primary,
      };
    case 'blue':
    default:
      return {
        backgroundColor: V2_COLORS.accent.blueSoft,
        textColor: V2_COLORS.accent.blue,
        accentColor: V2_COLORS.accent.blue,
      };
  }
};
