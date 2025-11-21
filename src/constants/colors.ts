export const COLORS = {
  background: {
    primary: '#18181B',   // 전체 배경
    secondary: '#232326', // 카드/컨테이너 배경
    tertiary: '#303033',  // 드롭다운 배경
    quaternary: '#48484A',  // 더 옅은 배경
    white: '#FFFFFF',     // 화이트 배경
    whiteSecondary: '#E4E4E7', // 흰색 보조 배경
    surface: '#27272A',   // 서피스 배경
    card: '#232326',      // 카드/컨테이너 배경 (alias)
    dropdown: '#303033',  // 드롭다운 배경 (alias)
  },
  text: {
    primary: '#F3F4F6',   // 주요 텍스트
    secondary: '#A1A1AA', // 보조 텍스트
    tertiary: '#606069',  // 보조 텍스트 (더 연한)
    disabled: '#52525B',  // 비활성화 텍스트
    buttonText: '#18181B', // 버튼 텍스트
    white: '#FFFFFF',     // 흰색 텍스트
    black: '#000000',     // 블랙 텍스트
    blackSecondary: '#18181B', // 블랙 보조 텍스트
  },
  accent: {
    green: '#4ADE80',     // 포인트(버튼, 태그, 플로팅 버튼)
    blue: '#3B82F6',      // 파란색 포인트
    red: '#EF4444',       // 빨간색 포인트
    orange: '#F59E0B',    // 오렌지 포인트
  },
  border: {
    default: '#27272A',   // 카드/입력창 등 경계선
    primary: '#27272A',   // 주요 경계선
    light: '#9999A2',     // 연한 경계선
    dark: '#48484A',     // 어두운 경계선
    moreDark: '#303033', // 더 어두운 경계선
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