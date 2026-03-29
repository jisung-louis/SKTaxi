import {COLORS} from '@/shared/design-system/tokens';

export const getCafeteriaCategoryColors = (categoryCode: string) => {
  switch (categoryCode) {
    case 'rollNoodles':
      return {
        headerGradientColors: ['#FFF1E6', '#FED7AA'],
        headerTextColor: COLORS.accent.orange,
        pillBackgroundColor: COLORS.accent.orangeSoft,
        pillTextColor: COLORS.accent.orange,
      };
    case 'theBab':
      return {
        headerGradientColors: ['#ECFDF5', '#BBF7D0'],
        headerTextColor: COLORS.brand.primaryStrong,
        pillBackgroundColor: COLORS.brand.primaryTint,
        pillTextColor: COLORS.brand.primaryStrong,
      };
    case 'fryRice':
      return {
        headerGradientColors: ['#EFF6FF', '#BFDBFE'],
        headerTextColor: COLORS.accent.blue,
        pillBackgroundColor: COLORS.accent.blueSoft,
        pillTextColor: COLORS.accent.blue,
      };
    default:
      return {
        headerGradientColors: [COLORS.background.subtle, COLORS.background.gray],
        headerTextColor: COLORS.text.strong,
        pillBackgroundColor: COLORS.background.subtle,
        pillTextColor: COLORS.text.secondary,
      };
  }
};
