import type {
  CampusTimetablePeriodViewData,
  CampusTimetableSessionViewData,
} from '../model/campusHome';

export const TIMETABLE_ROW_HEIGHT = 52;

export type RenderedTimetableRow =
  | {
      type: 'empty';
      period: CampusTimetablePeriodViewData;
    }
  | {
      type: 'session';
      period: CampusTimetablePeriodViewData;
      session: CampusTimetableSessionViewData;
      renderedSpan: number;
      endTimeLabel?: string;
    };

export const buildVisibleTimetableRows = ({
  periods,
  sessions,
  visibleEndPeriod,
}: {
  periods: CampusTimetablePeriodViewData[];
  sessions: CampusTimetableSessionViewData[];
  visibleEndPeriod: number;
}): RenderedTimetableRow[] => {
  const rows: RenderedTimetableRow[] = [];
  const periodsByNumber = new Map(
    periods.map(period => [period.periodNumber, period]),
  );
  const sortedSessions = [...sessions].sort(
    (left, right) => left.startPeriod - right.startPeriod,
  );

  let currentPeriodNumber = 1;

  while (currentPeriodNumber <= visibleEndPeriod) {
    const period = periodsByNumber.get(currentPeriodNumber);

    if (!period) {
      currentPeriodNumber += 1;
      continue;
    }

    const session = sortedSessions.find(
      candidate =>
        candidate.startPeriod <= currentPeriodNumber &&
        candidate.endPeriod >= currentPeriodNumber,
    );

    if (!session) {
      rows.push({
        type: 'empty',
        period,
      });
      currentPeriodNumber += 1;
      continue;
    }

    const renderedEndPeriod = Math.min(session.endPeriod, visibleEndPeriod);
    const renderedSpan = renderedEndPeriod - currentPeriodNumber + 1;
    const endPeriod = periodsByNumber.get(renderedEndPeriod);

    rows.push({
      type: 'session',
      period,
      session,
      renderedSpan,
      endTimeLabel: renderedSpan > 1 ? endPeriod?.endTimeLabel : undefined,
    });

    currentPeriodNumber = renderedEndPeriod + 1;
  }

  return rows;
};
