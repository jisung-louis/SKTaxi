import { v2Border } from './border';
import { v2Colors } from './colors';
import { v2Radius } from './radius';
import { v2Shadow } from './shadow';
import { v2Spacing } from './spacing';
import { v2Typography } from './typography';

export { v2Border } from './border';
export type { V2Border } from './border';
export { v2Colors } from './colors';
export type { V2Colors } from './colors';
export { v2Radius } from './radius';
export type { V2Radius } from './radius';
export { v2Shadow } from './shadow';
export type { V2Shadow, V2ShadowLayer, V2ShadowToken } from './shadow';
export { v2Spacing } from './spacing';
export type { V2Spacing } from './spacing';
export { v2Typography } from './typography';
export type { V2Typography } from './typography';

export const v2Foundation = {
  colors: v2Colors,
  typography: v2Typography,
  spacing: v2Spacing,
  radius: v2Radius,
  border: v2Border,
  shadow: v2Shadow,
} as const;

export type V2Foundation = typeof v2Foundation;
