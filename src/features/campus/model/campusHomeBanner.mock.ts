import type {CampusBannerSourceData} from './campusHomeBanner';

export const CAMPUS_HOME_BANNER_MOCK_SOURCE: readonly CampusBannerSourceData[] =
  [
    {
      badgeLabel: '택시 파티',
      buttonLabel: '파티 찾기',
      descriptionLabel: '같은 방향 가는 학생과 택시비를 함께 나눠요',
      id: 'taxi-main',
      imageUrl: 'wireframe://taxi',
      palette: {
        accent: '#16A34A',
        backgroundGradient: ['#F0FDF4', '#DCFCE7'],
        badgeBackground: 'rgba(22, 163, 74, 0.12)',
        badgeText: '#16A34A',
        buttonBackground: '#16A34A',
        buttonText: '#FFFFFF',
      },
      titleLabel: '택시 동승 매칭',
    },
    {
      badgeLabel: '공지사항',
      buttonLabel: '공지 보기',
      descriptionLabel: '중요한 학교 소식을 놓치지 말고 확인하세요',
      id: 'notice-main',
      imageUrl: 'wireframe://notice',
      palette: {
        accent: '#2563EB',
        backgroundGradient: ['#EFF6FF', '#DBEAFE'],
        badgeBackground: 'rgba(37, 99, 235, 0.12)',
        badgeText: '#2563EB',
        buttonBackground: '#2563EB',
        buttonText: '#FFFFFF',
      },
      titleLabel: '학교 공지사항',
    },
    {
      badgeLabel: '시간표',
      buttonLabel: '시간표 보기',
      descriptionLabel: '오늘 수업 일정을 한눈에 확인하세요',
      id: 'timetable-all',
      imageUrl: 'wireframe://timetable',
      palette: {
        accent: '#7C3AED',
        backgroundGradient: ['#FAF5FF', '#EDE9FE'],
        badgeBackground: 'rgba(124, 58, 237, 0.12)',
        badgeText: '#7C3AED',
        buttonBackground: '#7C3AED',
        buttonText: '#FFFFFF',
      },
      titleLabel: '나의 시간표',
    },
  ] as const;
