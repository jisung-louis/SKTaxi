export const v2Colors = {
  bg: {
    app: '#F9FAFB',
    surface: '#FFFFFF',
    subtle: '#F3F4F6',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    quaternary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E5E7EB',
    subtle: '#F3F4F6',
  },
  brand: {
    wordmark: '#10B981',
  },
  accent: {
    green: {
      base: '#22C55E',
      strong: '#16A34A',
      soft: '#DCFCE7',
      surface: '#F0FDF4',
      border: '#BBF7D0',
    },
    blue: {
      base: '#2563EB',
      soft: '#DBEAFE',
      surface: '#EFF6FF',
    },
    orange: {
      base: '#EA580C',
      soft: '#FFF7ED',
      bar: '#FB923C',
    },
    purple: {
      base: '#9333EA',
      soft: '#FAF5FF',
      iconBg: '#F3E8FF',
    },
    red: {
      base: '#EF4444',
    },
  },
  // Event is intentionally omitted until open-questions resolves it.
  category: {
    academic: {
      bg: '#EFF6FF',
      text: '#2563EB',
    },
    scholarship: {
      bg: '#FAF5FF',
      text: '#9333EA',
    },
    career: {
      bg: '#FFF7ED',
      text: '#EA580C',
    },
    facility: {
      bg: '#F3F4F6',
      text: '#4B5563',
    },
  },
  status: {
    unread: {
      dot: '#22C55E',
      surface: '#F0FDF4',
      border: '#BBF7D0',
      title: '#14532D',
      body: '#15803D',
      text: '#16A34A',
    },
    taxi: {
      recruiting: {
        bg: '#F0FDF4',
        text: '#16A34A',
      },
      closed: {
        bg: '#F3F4F6',
        text: '#6B7280',
      },
    },
    destructive: {
      text: '#EF4444',
    },
  },
} as const;

export type V2Colors = typeof v2Colors;
