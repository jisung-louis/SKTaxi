import { v2Colors } from './colors';

export const v2Border = {
  width: {
    default: 1,
    strong: 2,
  },
  rule: {
    header: {
      width: 1,
      color: v2Colors.border.default,
      placement: 'bottom',
    },
    tabBar: {
      width: 1,
      color: v2Colors.border.default,
      placement: 'top',
    },
    groupedList: {
      width: 1,
      color: v2Colors.border.default,
    },
    cardDivider: {
      width: 1,
      color: v2Colors.border.subtle,
    },
    segmentActive: {
      width: 2,
      color: v2Colors.accent.green.base,
      placement: 'bottom',
    },
  },
} as const;

export type V2Border = typeof v2Border;
