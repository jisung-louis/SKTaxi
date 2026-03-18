export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
} as const;

export type RadiusToken = typeof RADIUS;
