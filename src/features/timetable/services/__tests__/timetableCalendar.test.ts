import {
  formatSemesterDisplay,
  generatePeriods,
  getPeriodTimeInfo,
} from '../timetableCalendar';

describe('timetableCalendar', () => {
  it('1교시부터 15교시까지 생성한다', () => {
    expect(generatePeriods()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('교시별 시간 정보를 반환한다', () => {
    expect(getPeriodTimeInfo(1)).toEqual({
      startTime: '09:00',
      endTime: '09:50',
    });
    expect(getPeriodTimeInfo(99)).toEqual({
      startTime: '00:00',
      endTime: '00:00',
    });
  });

  it('학기 표시 문자열을 포맷한다', () => {
    expect(formatSemesterDisplay('2026-1')).toBe('2026년 1학기');
  });
});
