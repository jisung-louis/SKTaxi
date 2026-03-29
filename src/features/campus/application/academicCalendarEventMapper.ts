import type {AcademicSchedule} from '../model/academic';
import type {AcademicCalendarEventSource} from '../model/academicCalendarDetailSource';

export const toAcademicCalendarEventSource = (
  schedule: AcademicSchedule,
): AcademicCalendarEventSource => ({
  endDate: schedule.endDate,
  id: schedule.id,
  isImportant: Boolean(schedule.isPrimary),
  startDate: schedule.startDate,
  title: schedule.title,
});
