import type {AcademicSchedule} from '../model/academic';
import type {AcademicCalendarEventSource} from '../model/academicCalendarDetailSource';

export const resolveAcademicEventKind = (
  schedule: AcademicSchedule,
): AcademicCalendarEventSource['kind'] => {
  const normalizedDescription = schedule.description?.trim().toLowerCase();

  if (
    normalizedDescription === 'holiday' ||
    normalizedDescription === 'semester' ||
    normalizedDescription === 'registration' ||
    normalizedDescription === 'exam' ||
    normalizedDescription === 'closure'
  ) {
    return normalizedDescription;
  }

  if (/시험/.test(schedule.title)) {
    return 'exam';
  }

  if (/수강|신청|등록/.test(schedule.title)) {
    return 'registration';
  }

  if (/휴강|방학|종강/.test(schedule.title)) {
    return 'closure';
  }

  if (/개강|학기/.test(schedule.title)) {
    return 'semester';
  }

  return 'semester';
};

export const toAcademicCalendarEventSource = (
  schedule: AcademicSchedule,
): AcademicCalendarEventSource => ({
  endDate: schedule.endDate,
  id: schedule.id,
  isImportant: Boolean(schedule.isPrimary),
  kind: resolveAcademicEventKind(schedule),
  startDate: schedule.startDate,
  title: schedule.title,
});
