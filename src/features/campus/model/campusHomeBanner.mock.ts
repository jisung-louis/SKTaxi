import type {CampusBannerSourceData} from './campusHomeBanner';

export const CAMPUS_HOME_BANNER_MOCK_SOURCE: readonly CampusBannerSourceData[] =
  [
    {
      badgeLabel: '택시 파티',
      buttonLabel: '파티 찾기',
      descriptionLabel: '같은 방향 가는 학생과 택시비를 함께 나눠요',
      id: 'taxi-main',
      action: {
        target: 'TAXI_MAIN',
        type: 'inApp',
      },
      imageUrl: 'wireframe://taxi',
      paletteKey: 'GREEN',
      titleLabel: '택시 동승 매칭',
    },
    {
      badgeLabel: '공지사항',
      buttonLabel: '공지 보기',
      descriptionLabel: '중요한 학교 소식을 놓치지 말고 확인하세요',
      id: 'notice-main',
      action: {
        target: 'NOTICE_MAIN',
        type: 'inApp',
      },
      imageUrl: 'wireframe://notice',
      paletteKey: 'BLUE',
      titleLabel: '학교 공지사항',
    },
    {
      badgeLabel: '시간표',
      buttonLabel: '시간표 보기',
      descriptionLabel: '오늘 수업 일정을 한눈에 확인하세요',
      id: 'timetable-all',
      action: {
        params: {
          initialView: 'all',
        },
        target: 'TIMETABLE_DETAIL',
        type: 'inApp',
      },
      imageUrl: 'wireframe://timetable',
      paletteKey: 'PURPLE',
      titleLabel: '나의 시간표',
    },
  ] as const;
