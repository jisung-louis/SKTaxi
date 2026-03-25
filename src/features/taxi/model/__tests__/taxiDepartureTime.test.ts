import {
  buildTaxiSelectedDepartureDate,
  formatTaxiDepartureSummary,
} from '../taxiDepartureTime';

describe('taxiDepartureTime', () => {
  it('선택 시간이 현재와 같거나 이전이면 다음 날 출발로 계산한다', () => {
    const now = new Date(2026, 2, 25, 10, 30, 0, 0);

    const result = buildTaxiSelectedDepartureDate({
      hour: 10,
      minute: 30,
      now,
    });

    expect(result.isTomorrow).toBe(true);
    expect(result.date.getFullYear()).toBe(2026);
    expect(result.date.getMonth()).toBe(2);
    expect(result.date.getDate()).toBe(26);
    expect(result.date.getHours()).toBe(10);
    expect(result.date.getMinutes()).toBe(30);
  });

  it('선택 시간이 현재보다 이후면 오늘 출발로 계산한다', () => {
    const now = new Date(2026, 2, 25, 10, 30, 0, 0);

    const result = buildTaxiSelectedDepartureDate({
      hour: 10,
      minute: 31,
      now,
    });

    expect(result.isTomorrow).toBe(false);
    expect(result.date.getFullYear()).toBe(2026);
    expect(result.date.getMonth()).toBe(2);
    expect(result.date.getDate()).toBe(25);
    expect(result.date.getHours()).toBe(10);
    expect(result.date.getMinutes()).toBe(31);
  });

  it('출발 요약 라벨을 today/tomorrow 규칙에 맞게 포맷한다', () => {
    expect(
      formatTaxiDepartureSummary({
        date: new Date(2026, 2, 25, 13, 5, 0, 0),
        isTomorrow: false,
      }),
    ).toBe('오늘 3월 25일 오후 01:05 출발');

    expect(
      formatTaxiDepartureSummary({
        date: new Date(2026, 2, 26, 0, 7, 0, 0),
        isTomorrow: true,
      }),
    ).toBe('내일 3월 26일 오전 12:07 출발');
  });
});
