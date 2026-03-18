export const V2_COLORS = {
  background: {
    page: '#F9FAFB',
    surface: '#FFFFFF',
    subtle: '#F3F4F6',
    gray: '#E5E7EB',
  },
  text: {
    primary: '#111827',
    strong: '#374151',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  border: {
    subtle: '#F3F4F6',
    default: '#E5E7EB',
    accent: '#BBF7D0',
  },
  brand: {
    logo: '#10B981',
    primaryAccent: '#4ADE80',
    primary: '#22C55E',
    primaryStrong: '#16A34A',
    primarySoft: '#DCFCE7',
    primaryTint: '#F0FDF4',
  },
  accent: {
    blue: '#2563EB',
    blueSoft: '#EFF6FF',
    yellow: '#EAB308',
    yellowSoft: '#FEF9C3',
    yellowBorder: '#FDE68A',
    yellowStrong: '#A16207',
    orange: '#EA580C',
    orangeSoft: '#FFF7ED',
    purple: '#9333EA',
    purpleSoft: '#FAF5FF',
    pink: '#DB2777',
    pinkSoft: '#FDF2F8',
  },
  status: {
    success: '#16A34A',
    warning: '#EA580C',
    info: '#2563EB',
    danger: '#DC2626',
  },
} as const;

export type V2ColorToken = typeof V2_COLORS;
