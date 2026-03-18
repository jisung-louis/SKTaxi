import {V2_COLORS} from '@/shared/design-system/tokens';

type AuthGradientColors = [string, string];

export const AUTH_BRAND_ACCENT_COLOR = V2_COLORS.brand.primaryAccent;
export const AUTH_BRAND_GRADIENT: AuthGradientColors = [
  V2_COLORS.brand.primaryAccent,
  V2_COLORS.brand.primary,
];

export const AUTH_ONBOARDING_STEP_COLORS = {
  att: {
    buttonColors: ['#C084FC', '#A855F7'] as AuthGradientColors,
    heroColor: '#C084FC',
  },
  complete: {
    buttonColors: AUTH_BRAND_GRADIENT,
    heroColor: V2_COLORS.brand.primaryAccent,
  },
  intro: {
    buttonColors: AUTH_BRAND_GRADIENT,
    heroColor: V2_COLORS.brand.primaryAccent,
  },
  location: {
    buttonColors: ['#FB923C', '#F97316'] as AuthGradientColors,
    heroColor: '#FB923C',
  },
  notification: {
    buttonColors: ['#60A5FA', '#3B82F6'] as AuthGradientColors,
    heroColor: '#60A5FA',
  },
} as const;
