import type { IAcademicRepository } from './IAcademicRepository';
import type { AcademicSchedule } from '../../model/academic';
import { academicCalendarDetailMockEvents } from '../../mocks/academicCalendarDetail.mock';

const schedules: AcademicSchedule[] = academicCalendarDetailMockEvents.map(event => ({
  id: event.id,
  title: event.title,
  startDate: event.startDate,
  endDate: event.endDate,
  type: event.startDate === event.endDate ? 'single' : 'multi',
  isPrimary: Boolean(event.isImportant),
  description: event.kind,
  createdAt: new Date(event.startDate),
  updatedAt: new Date(event.endDate),
}));

const intersectsDateRange = (
  schedule: AcademicSchedule,
  startDate: Date,
  endDate: Date,
) => {
  const scheduleStart = new Date(schedule.startDate).getTime();
  const scheduleEnd = new Date(schedule.endDate).getTime();
  return scheduleStart <= endDate.getTime() && scheduleEnd >= startDate.getTime();
};

export class MockAcademicRepository implements IAcademicRepository {
  async getSchedules(): Promise<AcademicSchedule[]> {
    return [...schedules];
  }

  async getSchedulesByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<AcademicSchedule[]> {
    return schedules.filter(schedule =>
      intersectsDateRange(schedule, startDate, endDate),
    );
  }
}
