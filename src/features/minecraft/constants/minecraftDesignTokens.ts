import type { TextStyle } from 'react-native';

import { COLORS } from '@/shared/design-system/tokens/colors';

export const MINECRAFT_COLORS = {
  background: {
    primary: COLORS.background.page,
    secondary: COLORS.background.surface,
    card: COLORS.background.surface,
    surface: COLORS.background.subtle,
    tertiary: COLORS.background.subtle,
  },
  text: {
    primary: COLORS.text.primary,
    secondary: COLORS.text.secondary,
    disabled: COLORS.text.muted,
  },
  border: {
    default: COLORS.border.default,
    moreDark: COLORS.border.default,
  },
  accent: {
    green: COLORS.brand.primary,
    blue: COLORS.accent.blue,
    orange: COLORS.accent.orange,
    red: COLORS.status.danger,
  },
} as const;

export const MINECRAFT_TYPOGRAPHY: Record<
  | 'title2'
  | 'title3'
  | 'body1'
  | 'body2'
  | 'caption1'
  | 'caption2'
  | 'caption3',
  TextStyle
> = {
  title2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  title3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  caption1: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  caption2: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
  },
  caption3: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '400',
  },
};
