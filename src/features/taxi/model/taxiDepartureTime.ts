export const TAXI_DEPARTURE_DAY_OFFSET_TODAY = 0 as const;
export const TAXI_DEPARTURE_DAY_OFFSET_TOMORROW = 1 as const;

export interface TaxiDepartureSelection {
  date: Date;
  dayOffset:
    | typeof TAXI_DEPARTURE_DAY_OFFSET_TODAY
    | typeof TAXI_DEPARTURE_DAY_OFFSET_TOMORROW;
  isTomorrow: boolean;
}

export const buildTaxiInitialPickerDate = () => {
  const initialDate = new Date();
  initialDate.setSeconds(0, 0);
  initialDate.setMinutes(initialDate.getMinutes() + 1);

  return initialDate;
};

export const buildTaxiSelectedDepartureDate = ({
  hour,
  minute,
  now,
}: {
  hour: number;
  minute: number;
  now: Date;
}): TaxiDepartureSelection => {
  const selectedDate = new Date(now);
  selectedDate.setHours(hour, minute, 0, 0);

  const selectedMinutes = hour * 60 + minute;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isTomorrow = selectedMinutes <= currentMinutes;

  if (isTomorrow) {
    selectedDate.setDate(selectedDate.getDate() + 1);
  }

  return {
    date: selectedDate,
    dayOffset: isTomorrow
      ? TAXI_DEPARTURE_DAY_OFFSET_TOMORROW
      : TAXI_DEPARTURE_DAY_OFFSET_TODAY,
    isTomorrow,
  };
};

export const formatTaxiDepartureSummary = ({
  date,
  isTomorrow,
}: {
  date: Date;
  isTomorrow: boolean;
}) => {
  const meridiem = date.getHours() >= 12 ? '오후' : '오전';
  const hour12 = date.getHours() % 12 || 12;
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  const dayLabel = isTomorrow ? '내일' : '오늘';

  return `${dayLabel} ${
    date.getMonth() + 1
  }월 ${date.getDate()}일 ${meridiem} ${`${hour12}`.padStart(
    2,
    '0',
  )}:${minute} 출발`;
};
