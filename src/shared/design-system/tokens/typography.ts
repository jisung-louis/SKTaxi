import type { TextStyle } from 'react-native';

export const TYPOGRAPHY: Record<
  | 'title1'
  | 'title2'
  | 'title3'
  | 'body1'
  | 'body2'
  | 'caption1'
  | 'caption2'
  | 'caption3',
  TextStyle
> = {
  title1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  title2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  title3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  body1: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
  },
  body2: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  caption1: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '400',
  },
  caption2: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '400',
  },
  caption3: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '400',
  },
};

export type TypographyToken = typeof TYPOGRAPHY;
