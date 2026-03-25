export const FONT_FAMILIES = {
  brand: {
    wordmark: 'Montserrat',
  },
} as const;

export type FontFamilyToken = typeof FONT_FAMILIES;
