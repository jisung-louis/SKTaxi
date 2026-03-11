import { COLORS, type ColorType } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';

export const legacyColors = COLORS;
export type LegacyColorType = ColorType;

export const legacyTypography = TYPOGRAPHY;
export type LegacyTypography = typeof TYPOGRAPHY;

export const legacyTokens = {
  colors: legacyColors,
  typography: legacyTypography,
} as const;
