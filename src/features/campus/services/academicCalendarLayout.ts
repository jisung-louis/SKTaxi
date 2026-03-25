import {
  isDateRangeOverlapping,
  normalizeDate,
  normalizeDateObject,
} from '@/shared/lib/date';

import type {AcademicCalendarEventSource} from '../model/academicCalendarDetailSource';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const diffInDays = (startDate: Date, endDate: Date) =>
  Math.round(
    (normalizeDateObject(endDate).getTime() -
      normalizeDateObject(startDate).getTime()) /
      DAY_IN_MS,
  );

export const getAcademicEventDurationDays = (
  event: AcademicCalendarEventSource,
) => diffInDays(normalizeDate(event.startDate), normalizeDate(event.endDate)) + 1;

export const getMonthWeeks = (currentDate: Date): Array<Array<Date | null>> => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const firstWeekday = firstDate.getDay();
  const daysInMonth = lastDate.getDate();
  const weeks: Array<Array<Date | null>> = [];

  let day = 1;

  while (day <= daysInMonth) {
    const week: Array<Date | null> = [];

    for (let column = 0; column < 7; column += 1) {
      const shouldFillBlank = weeks.length === 0 && column < firstWeekday;

      if (shouldFillBlank || day > daysInMonth) {
        week.push(null);
        continue;
      }

      week.push(new Date(year, month, day));
      day += 1;
    }

    weeks.push(week);
  }

  return weeks;
};

export const getWeekRange = (date: Date) => {
  const normalized = normalizeDateObject(date);
  const start = new Date(normalized);
  start.setDate(normalized.getDate() - normalized.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start,
    end,
  };
};

export const getEventsInRange = (
  events: AcademicCalendarEventSource[],
  startDate: Date,
  endDate: Date,
) =>
  events.filter(event =>
    isDateRangeOverlapping(event.startDate, event.endDate, startDate, endDate),
  );

interface PositionedAcademicEvent {
  endColumn: number;
  event: AcademicCalendarEventSource;
  leftColumn: number;
  roundedEnd: boolean;
  roundedStart: boolean;
  rowIndex: number;
  span: number;
}

export const getPositionedEventsForRange = ({
  endDate,
  events,
  startDate,
}: {
  endDate: Date;
  events: AcademicCalendarEventSource[];
  startDate: Date;
}): PositionedAcademicEvent[] => {
  const sortedEvents = [...events].sort((left, right) => {
    const durationDifference =
      getAcademicEventDurationDays(right) - getAcademicEventDurationDays(left);

    if (durationDifference !== 0) {
      return durationDifference;
    }

    return (
      normalizeDate(left.startDate).getTime() -
      normalizeDate(right.startDate).getTime()
    );
  });

  const lanes: PositionedAcademicEvent[][] = [];

  return sortedEvents.map(event => {
    const eventStart = normalizeDate(event.startDate);
    const eventEnd = normalizeDate(event.endDate);
    const visibleStart = eventStart > startDate ? eventStart : startDate;
    const visibleEnd = eventEnd < endDate ? eventEnd : endDate;
    const leftColumn = Math.max(0, diffInDays(startDate, visibleStart));
    const endColumn = Math.min(6, diffInDays(startDate, visibleEnd));
    const span = endColumn - leftColumn + 1;

    let rowIndex = lanes.findIndex(lane =>
      lane.every(
        positioned =>
          positioned.endColumn < leftColumn ||
          endColumn < positioned.leftColumn,
      ),
    );

    if (rowIndex < 0) {
      rowIndex = lanes.length;
      lanes.push([]);
    }

    const positionedEvent: PositionedAcademicEvent = {
      endColumn,
      event,
      leftColumn,
      roundedEnd: eventEnd <= endDate,
      roundedStart: eventStart >= startDate,
      rowIndex,
      span,
    };

    lanes[rowIndex].push(positionedEvent);

    return positionedEvent;
  });
};
