/**
 * @deprecated Legacy pre-v2 token set.
 * Do not use this file for new or refactored UI.
 * Use `@/shared/design-system/tokens` for v2 screens and primitives.
 */
export const COLORS = {
  background: {
    primary: '#18181B',
    secondary: '#232326',
    tertiary: '#303033',
    quaternary: '#48484A',
    white: '#FFFFFF',
    whiteSecondary: '#E4E4E7',
    surface: '#27272A',
    card: '#232326',
    dropdown: '#303033',
  },
  text: {
    primary: '#F3F4F6',
    secondary: '#A1A1AA',
    tertiary: '#606069',
    disabled: '#52525B',
    buttonText: '#18181B',
    white: '#FFFFFF',
    black: '#000000',
    blackSecondary: '#18181B',
  },
  accent: {
    green: '#4ADE80',
    blue: '#3B82F6',
    red: '#EF4444',
    orange: '#F59E0B',
  },
  border: {
    default: '#27272A',
    primary: '#27272A',
    light: '#9999A2',
    dark: '#48484A',
    moreDark: '#303033',
  },
  gray: {
    100: '#F7FAFC',
    200: '#EDF2F7',
    300: '#E2E8F0',
    400: '#CBD5E0',
    500: '#A0AEC0',
    600: '#718096',
    700: '#4A5568',
    800: '#2D3748',
    900: '#1A202C',
  },
  error: '#E53E3E',
  success: '#38A169',
  warning: '#DD6B20',
} as const;

export type ColorType = typeof COLORS;
