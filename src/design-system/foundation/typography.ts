import type { TextStyle } from 'react-native';

export const v2Typography = {
  display: {
    brand: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '400',
    } satisfies TextStyle,
  },
  title: {
    screen: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '700',
    } satisfies TextStyle,
    profile: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '700',
    } satisfies TextStyle,
    section: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '700',
    } satisfies TextStyle,
    card: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
    } satisfies TextStyle,
  },
  body: {
    default: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    } satisfies TextStyle,
    medium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    } satisfies TextStyle,
  },
  meta: {
    default: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
    } satisfies TextStyle,
    medium: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
    } satisfies TextStyle,
  },
  tab: {
    label: {
      fontSize: 10,
      lineHeight: 15,
      fontWeight: '500',
    } satisfies TextStyle,
  },
  stat: {
    large: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700',
    } satisfies TextStyle,
  },
  fare: {
    emphasis: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
    } satisfies TextStyle,
  },
} as const;

export type V2Typography = typeof v2Typography;
