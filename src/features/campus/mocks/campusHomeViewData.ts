import type { CampusHomeViewData } from '../model/campusHome';

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
    periods: [
      {
        id: 'period-1',
        periodLabel: '1교시',
        startTimeLabel: '09:00',
        isEmpty: true,
      },
      {
        id: 'period-2',
        periodLabel: '2교시',
        startTimeLabel: '09:55',
        title: '자료구조',
        instructorLabel: '윤성호 교수님',
        roomLabel: '공학관 205',
        tone: 'orange',
      },
      {
        id: 'period-3',
        periodLabel: '3교시',
        startTimeLabel: '10:50',
        isEmpty: true,
      },
      {
        id: 'period-4',
        periodLabel: '4교시',
        startTimeLabel: '11:55',
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
        id: 'period-5',
        periodLabel: '5교시',
        startTimeLabel: '12:50',
        isEmpty: true,
      },
      {
        id: 'period-6',
        periodLabel: '6교시',
        startTimeLabel: '13:45',
        isEmpty: true,
      },
      {
        id: 'period-7',
        periodLabel: '7교시',
        startTimeLabel: '14:40',
        isEmpty: true,
      },
      {
        id: 'period-8',
        periodLabel: '8교시',
        startTimeLabel: '15:35',
        isEmpty: true,
      },
      {
        id: 'period-9',
        periodLabel: '9교시',
        startTimeLabel: '16:30',
        isEmpty: true,
      },
      {
        id: 'period-10',
        periodLabel: '10교시',
        startTimeLabel: '17:25',
        isEmpty: true,
      },
      {
        id: 'period-11',
        periodLabel: '11교시',
        startTimeLabel: '18:20',
        isEmpty: true,
      },
      {
        id: 'period-12',
        periodLabel: '12교시',
        startTimeLabel: '19:15',
        isEmpty: true,
      },
      {
        id: 'period-13',
        periodLabel: '13교시',
        startTimeLabel: '20:10',
        isEmpty: true,
      },
      {
        id: 'period-14',
        periodLabel: '14교시',
        startTimeLabel: '21:05',
        isEmpty: true,
      },
      {
        id: 'period-15',
        periodLabel: '15교시',
        startTimeLabel: '21:40',
        isEmpty: true,
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
    featuredMenu: {
      id: 'cafeteria-featured-menu',
      title: '제육볶음',
      description: '된장국, 시금치나물, 배추김치',
      priceLabel: '5,000원',
    },
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
    periods: [],
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
    featuredMenu: {
      id: 'cafeteria-featured-menu-weekend',
      title: '김치찌개',
      description: '계란말이, 깍두기, 배추김치',
      priceLabel: '5,000원',
    },
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
