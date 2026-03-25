export type AcademicCalendarEventKind =
  | 'holiday'
  | 'semester'
  | 'registration'
  | 'exam'
  | 'closure';

export interface AcademicCalendarEventSource {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  kind: AcademicCalendarEventKind;
  isImportant?: boolean;
}
