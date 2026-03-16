import type {AcademicCalendarEventSource} from '../model/academicCalendarDetailSource';

export const academicCalendarDetailMockEvents: AcademicCalendarEventSource[] = [
  {
    id: 'event-mar-01',
    title: '3·1절',
    startDate: '2026-03-01',
    endDate: '2026-03-01',
    kind: 'holiday',
  },
  {
    id: 'event-mar-02',
    title: '2026학년도 1학기 개강',
    startDate: '2026-03-02',
    endDate: '2026-03-02',
    kind: 'semester',
  },
  {
    id: 'event-mar-03',
    title: '수강신청 변경 및 취소',
    startDate: '2026-03-03',
    endDate: '2026-03-06',
    isImportant: true,
    kind: 'registration',
  },
  {
    id: 'event-jun-06',
    title: '현충일',
    startDate: '2026-06-06',
    endDate: '2026-06-06',
    kind: 'holiday',
  },
  {
    id: 'event-jun-15',
    title: '기말고사',
    startDate: '2026-06-15',
    endDate: '2026-06-19',
    isImportant: true,
    kind: 'exam',
  },
  {
    id: 'event-jun-19',
    title: '1학기 종강',
    startDate: '2026-06-19',
    endDate: '2026-06-19',
    kind: 'closure',
  },
];
