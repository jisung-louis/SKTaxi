import type { TextStyle } from 'react-native';

import { V2_COLORS } from '@/shared/design-system/tokens/colors';

export const MINECRAFT_COLORS = {
  background: {
    primary: V2_COLORS.background.page,
    secondary: V2_COLORS.background.surface,
    card: V2_COLORS.background.surface,
    surface: V2_COLORS.background.subtle,
    tertiary: V2_COLORS.background.subtle,
  },
  text: {
    primary: V2_COLORS.text.primary,
    secondary: V2_COLORS.text.secondary,
    disabled: V2_COLORS.text.muted,
  },
  border: {
    default: V2_COLORS.border.default,
    moreDark: V2_COLORS.border.default,
  },
  accent: {
    green: V2_COLORS.brand.primary,
    blue: V2_COLORS.accent.blue,
    orange: V2_COLORS.accent.orange,
    red: V2_COLORS.status.danger,
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
