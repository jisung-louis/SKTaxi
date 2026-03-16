import type {AcademicCalendarEventSource} from '../../model/academicCalendarDetailSource';

export interface IAcademicCalendarDetailRepository {
  listEvents(): Promise<AcademicCalendarEventSource[]>;
}
