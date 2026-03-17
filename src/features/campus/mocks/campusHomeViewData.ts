import type { CampusHomeViewData } from '../model/campusHome';
import {cafeteriaDetailMockData} from './cafeteriaDetail.mock';
import {
  generatePeriods,
  getPeriodTimeInfo,
} from '@/features/timetable/services/timetableUtils';

const createCampusTimetablePeriods = () =>
  generatePeriods().map(periodNumber => {
    const timeInfo = getPeriodTimeInfo(periodNumber);

    return {
      id: `period-${periodNumber}`,
      periodNumber,
      periodLabel: `${periodNumber}교시`,
      startTimeLabel: timeInfo.startTime,
      endTimeLabel: timeInfo.endTime,
    };
  });

const createCampusRecommendedMenus = () =>
  cafeteriaDetailMockData.categories
    .flatMap(category =>
      category.items.map(item => ({
        categoryLabel: category.title,
        id: item.id,
        likeCount: item.positiveCount,
        netScore: item.positiveCount - item.secondaryCount,
        priceLabel: `${item.price.toLocaleString('ko-KR')}원`,
        title: item.title,
      })),
    )
    .sort(
      (left, right) =>
        right.netScore - left.netScore ||
        right.likeCount - left.likeCount ||
        left.title.localeCompare(right.title, 'ko-KR'),
    )
    .slice(0, 3)
    .map(({categoryLabel, id, likeCount, priceLabel, title}) => ({
      categoryLabel,
      id,
      likeCountLabel: `${likeCount}`,
      priceLabel,
      title,
    }));

export const createDefaultCampusHomeViewData = (): CampusHomeViewData => ({
  notices: {
    items: [
      {
        id: 'notice-academic-midterm',
        categoryLabel: '학사',
        publishedAtLabel: '2024-03-15',
        title: '2024학년도 1학기 중간고사 일정 안내',
        tone: 'brand',
      },
      {
        id: 'notice-scholarship-national',
        categoryLabel: '장학',
        publishedAtLabel: '2024-03-14',
        title: '2024년 1학기 국가장학금 신청 안내',
        tone: 'brand',
      },
    ],
  },
  timetable: {
    dateLabel: '3월 10일 화요일 2주차',
    collapsedVisibleCount: 9,
    periods: createCampusTimetablePeriods(),
    sessions: [
      {
        id: 'session-data-structures',
        startPeriod: 2,
        endPeriod: 2,
        title: '자료구조',
        instructorLabel: '윤성호 교수님',
        roomLabel: '공학관 205',
        tone: 'orange',
      },
      {
        id: 'session-operating-systems',
        startPeriod: 4,
        endPeriod: 6,
        title: '운영체제',
        instructorLabel: '이서현 교수님',
        roomLabel: '공학관 302',
        tone: 'blue',
        isCurrent: true,
        status: {
          label: '진행중',
          tone: 'blue',
        },
      },
    ],
  },
  taxi: {
    items: [
      {
        id: 'taxi-anyang-station-morning',
        routeLabel: '안양역 → 성결대',
        departureTimeLabel: '오전 09:00',
        seatStatusLabel: '2/4명',
      },
      {
        id: 'taxi-anyang-station-afternoon',
        routeLabel: '안양역 → 성결대',
        departureTimeLabel: '오후 01:00',
        seatStatusLabel: '1/4명',
      },
    ],
  },
  cafeteria: {
    recommendedMenus: createCampusRecommendedMenus(),
  },
  academicCalendar: {
    items: [
      {
        id: 'calendar-midterm',
        monthLabel: '4월',
        dayLabel: '15',
        title: '중간고사',
        dateRangeLabel: '2024-04-15 ~ 2024-04-19',
        badge: {
          label: '시험',
          tone: 'blue',
          placement: 'trailing',
        },
      },
      {
        id: 'calendar-festival',
        monthLabel: '5월',
        dayLabel: '10',
        title: '봄 축제',
        dateRangeLabel: '2024-05-10 ~ 2024-05-11',
        badge: {
          label: '행사',
          tone: 'blue',
          placement: 'trailing',
        },
      },
      {
        id: 'calendar-course-change',
        monthLabel: '3월',
        dayLabel: '25',
        title: '수강신청 변경',
        dateRangeLabel: '2024-03-25 ~ 2024-03-29',
        badge: {
          label: '학사',
          tone: 'blue',
          placement: 'trailing',
        },
      },
    ],
  },
});

export const createCrossBoundaryCampusHomeViewData = (): CampusHomeViewData => ({
  ...createDefaultCampusHomeViewData(),
  timetable: {
    dateLabel: '3월 11일 수요일 2주차',
    collapsedVisibleCount: 9,
    periods: createCampusTimetablePeriods(),
    sessions: [
      {
        id: 'session-data-structures',
        startPeriod: 2,
        endPeriod: 2,
        title: '자료구조',
        instructorLabel: '윤성호 교수님',
        roomLabel: '공학관 205',
        tone: 'orange',
      },
      {
        id: 'session-operating-systems',
        startPeriod: 4,
        endPeriod: 6,
        title: '운영체제',
        instructorLabel: '이서현 교수님',
        roomLabel: '공학관 302',
        tone: 'blue',
        isCurrent: true,
        status: {
          label: '진행중',
          tone: 'blue',
        },
      },
      {
        id: 'session-capstone-project',
        startPeriod: 9,
        endPeriod: 11,
        title: '캡스톤디자인',
        instructorLabel: '박민석 교수님',
        roomLabel: '공학관 512',
        tone: 'orange',
      },
      {
        id: 'session-night-lab',
        startPeriod: 12,
        endPeriod: 13,
        title: '실험실 세미나',
        instructorLabel: '김유진 교수님',
        roomLabel: '공학관 610',
        tone: 'blue',
      },
    ],
  },
});

export const createNoCourseCampusHomeViewData = (): CampusHomeViewData => ({
  notices: {
    items: [
      {
        id: 'notice-academic-midterm',
        categoryLabel: '학사',
        publishedAtLabel: '2025-03-15',
        title: '2025학년도 1학기 중간고사 일정 안내',
        tone: 'brand',
      },
      {
        id: 'notice-scholarship-national',
        categoryLabel: '장학',
        publishedAtLabel: '2025-03-14',
        title: '2025년 1학기 국가장학금 신청 안내',
        tone: 'brand',
      },
    ],
  },
  timetable: {
    dateLabel: '3월 15일 일요일 2주차',
    collapsedVisibleCount: 9,
    periods: createCampusTimetablePeriods(),
    sessions: [],
    emptyState: {
      title: '오늘은 수업이 없어요',
      description: '주말을 즐기세요',
    },
  },
  taxi: {
    items: [
      {
        id: 'taxi-anyang-station-morning',
        routeLabel: '안양역 → 성결대',
        departureTimeLabel: '오전 09:00',
        seatStatusLabel: '2/4명',
      },
      {
        id: 'taxi-anyang-station-afternoon',
        routeLabel: '안양역 → 성결대',
        departureTimeLabel: '오후 01:00',
        seatStatusLabel: '1/4명',
      },
    ],
  },
  cafeteria: {
    recommendedMenus: createCampusRecommendedMenus(),
  },
  academicCalendar: {
    items: [
      {
        id: 'calendar-semester-start',
        monthLabel: '3월',
        dayLabel: '3',
        title: '2025학년도 1학기 개강',
        dateRangeLabel: '2025-03-03 ~ 2025-03-03',
      },
      {
        id: 'calendar-course-change-important',
        monthLabel: '3월',
        dayLabel: '4',
        title: '수강신청 변경 및 취소',
        dateRangeLabel: '2025-03-04 ~ 2025-03-07',
        badge: {
          label: '중요',
          tone: 'pink',
          placement: 'inline',
        },
      },
      {
        id: 'calendar-national-holiday',
        monthLabel: '3월',
        dayLabel: '1',
        title: '3·1절 (공휴일)',
        dateRangeLabel: '2025-03-01 ~ 2025-03-01',
      },
    ],
  },
});
