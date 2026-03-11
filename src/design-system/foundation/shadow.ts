import { v2Colors } from './colors';

export type V2ShadowLayer = Readonly<{
  color: string;
  opacity: number;
  x: number;
  y: number;
  blur: number;
  spread: number;
}>;

export type V2ShadowToken = Readonly<{
  css: string;
  layers: readonly V2ShadowLayer[];
}>;

// Keep the exact Figma shadow layers here and let later primitives decide
// how to translate them to platform-specific shadow styles.
export const v2Shadow = {
  card: {
    css: '0px 1px 2px 0px rgba(0,0,0,0.05)',
    layers: [
      {
        color: '#000000',
        opacity: 0.05,
        x: 0,
        y: 1,
        blur: 2,
        spread: 0,
      },
    ],
  },
  primaryCta: {
    css: '0px 4px 6px -4px rgba(34,197,94,0.3), 0px 10px 15px -3px rgba(34,197,94,0.3)',
    layers: [
      {
        color: v2Colors.accent.green.base,
        opacity: 0.3,
        x: 0,
        y: 4,
        blur: 6,
        spread: -4,
      },
      {
        color: v2Colors.accent.green.base,
        opacity: 0.3,
        x: 0,
        y: 10,
        blur: 15,
        spread: -3,
      },
    ],
  },
  fab: {
    css: '0px 4px 6px -4px rgba(34,197,94,0.4), 0px 10px 15px -3px rgba(34,197,94,0.4)',
    layers: [
      {
        color: v2Colors.accent.green.base,
        opacity: 0.4,
        x: 0,
        y: 4,
        blur: 6,
        spread: -4,
      },
      {
        color: v2Colors.accent.green.base,
        opacity: 0.4,
        x: 0,
        y: 10,
        blur: 15,
        spread: -3,
      },
    ],
  },
} as const satisfies Record<string, V2ShadowToken>;

export type V2Shadow = typeof v2Shadow;
