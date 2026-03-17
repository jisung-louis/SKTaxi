export type OnboardingVisualStepId =
  | 'intro'
  | 'notification'
  | 'att'
  | 'location'
  | 'complete';

export interface OnboardingFeatureItem {
  iconName: string;
  label: string;
}

export interface OnboardingVisualStep {
  actionLabel: string;
  buttonColors: [string, string];
  features: OnboardingFeatureItem[];
  footerLines?: string[];
  heroColor: string;
  heroIconName: string;
  id: OnboardingVisualStepId;
  kicker?: string;
  subtitle: string;
  title: string;
}

export const ONBOARDING_STEP_VIEW_DATA: Record<
  OnboardingVisualStepId,
  OnboardingVisualStep
> = {
  intro: {
    actionLabel: '시작하기',
    buttonColors: ['#4ADE80', '#22C55E'],
    features: [
      {iconName: 'car-sport', label: '택시 동승 파티로 택시비 절약'},
      {iconName: 'notifications', label: '학교 공지 알림을 실시간으로'},
      {iconName: 'calendar', label: '학사일정과 시간표를 한 곳에서'},
      {iconName: 'restaurant', label: '오늘의 학식도 확인하고'},
    ],
    heroColor: '#4ADE80',
    heroIconName: 'car-sport',
    id: 'intro',
    subtitle: '성결대 학생을 위한 올인원 캠퍼스 앱이에요',
    title: '스쿠리에 오신 걸\n환영해요!',
  },
  notification: {
    actionLabel: '알림 허용하기',
    buttonColors: ['#60A5FA', '#3B82F6'],
    features: [
      {iconName: 'megaphone', label: '학교 공지사항 실시간 알림'},
      {iconName: 'calendar', label: '학교 학사일정 실시간 알림'},
      {iconName: 'car-sport', label: '동승 요청 승인/거절 알림'},
      {iconName: 'chatbubble', label: '파티 채팅 메시지 알림'},
    ],
    footerLines: ['세부 알림 설정은 앱 내에서 제어할 수 있어요'],
    heroColor: '#60A5FA',
    heroIconName: 'notifications',
    id: 'notification',
    kicker: '이 앱이 잘 작동하려면...',
    subtitle: '',
    title: '알림 허용이\n필요해요',
  },
  att: {
    actionLabel: '허용하기',
    buttonColors: ['#C084FC', '#A855F7'],
    features: [
      {iconName: 'sparkles', label: '맞춤형 콘텐츠 제공'},
      {iconName: 'stats-chart', label: '서비스 개선을 위한 분석'},
      {iconName: 'person', label: '사용자 경험 최적화'},
    ],
    footerLines: [
      '거부하셔도 앱의 모든 기능을 사용할 수 있어요',
      '설정에서 언제든지 변경할 수 있습니다',
    ],
    heroColor: '#C084FC',
    heroIconName: 'shield-checkmark',
    id: 'att',
    kicker: '개인정보 보호를 위해',
    subtitle: '',
    title: '광고 추적 권한\n설정이 필요해요',
  },
  location: {
    actionLabel: '위치 허용하기',
    buttonColors: ['#FB923C', '#F97316'],
    features: [
      {iconName: 'locate', label: '현재 위치 기반 가까운 파티 찾기'},
      {iconName: 'car-sport', label: '파티 모임장소까지의 거리 계산'},
      {iconName: 'navigate', label: '택시 동승 요청시 출발지/도착지 설정'},
      {iconName: 'shield-checkmark', label: '안전한 동승 파티'},
    ],
    footerLines: [
      '내 위치 정보는 단말기 내에서만 활용되며 서버에 저장되지 않아요',
      '위치정보 권한 거절 시 택시 동승 파티 찾기 기능이 불가능해요',
    ],
    heroColor: '#FB923C',
    heroIconName: 'location',
    id: 'location',
    kicker: '정확한 위치 정보가 필요해요',
    subtitle: '',
    title: '택시 동승을 위해\n현재 위치를 확인해요',
  },
  complete: {
    actionLabel: '스쿠리 시작하기',
    buttonColors: ['#4ADE80', '#22C55E'],
    features: [
      {iconName: 'checkmark', label: '프로필 설정 완료'},
      {iconName: 'checkmark', label: '권한 설정 완료'},
      {iconName: 'checkmark', label: '모든 기능 사용 준비 완료'},
    ],
    heroColor: '#4ADE80',
    heroIconName: 'checkmark',
    id: 'complete',
    subtitle: '이제 성결대 캠퍼스 라이프를 더 스마트하게 즐겨보세요',
    title: '스쿠리 준비 완료!',
  },
};
