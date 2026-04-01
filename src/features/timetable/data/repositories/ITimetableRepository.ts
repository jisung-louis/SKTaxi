import type {
  TimetableManualCourseDraft,
  TimetableSemesterRecord,
} from '../../model/timetableDomain';
import type {TimetableCourseToneId} from '../../model/timetablePrimitives';

export interface ITimetableRepository {
  addCatalogCourse(params: {
    courseId: string;
    semesterId: string;
    toneId: TimetableCourseToneId;
  }): Promise<TimetableSemesterRecord | null>;
  addManualCourse(params: {
    draft: TimetableManualCourseDraft;
    semesterId: string;
  }): Promise<TimetableSemesterRecord | null>;
  getSemesterRecord(semesterId: string): Promise<TimetableSemesterRecord | null>;
  listSemesterRecords(): Promise<TimetableSemesterRecord[]>;
  removeCourse(params: {
    courseId: string;
    semesterId: string;
  }): Promise<TimetableSemesterRecord | null>;
}
