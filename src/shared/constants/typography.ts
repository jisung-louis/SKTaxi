import { TextStyle } from 'react-native';

/**
 * @deprecated Legacy pre-v2 typography scale.
 * Do not use this file for new or refactored UI.
 * Use v2 design-system tokens/primitives instead.
 */
export const TYPOGRAPHY: { [key: string]: TextStyle } = {
  title1: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  title2: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  title3: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 14,
  },
  caption2: {
    fontSize: 10,
    fontWeight: 'normal',
    lineHeight: 12,
  },
  caption3: {
    fontSize: 8,
    fontWeight: 'normal',
    lineHeight: 10,
  },
};
