import type {
  TimetableManualCourseDraft,
  TimetableSemesterRecord,
} from '../../model/timetableDetailSource';
import type {TimetableCourseToneId} from '../../model/timetableDetailViewData';

export interface ITimetableDetailRepository {
  addCatalogCourse(params: {
    courseId: string;
    replaceCourseIds?: string[];
    semesterId: string;
    toneId: TimetableCourseToneId;
  }): Promise<TimetableSemesterRecord | null>;
  addManualCourse(params: {
    draft: TimetableManualCourseDraft;
    replaceCourseIds?: string[];
    semesterId: string;
  }): Promise<TimetableSemesterRecord | null>;
  getSemesterRecord(semesterId: string): Promise<TimetableSemesterRecord | null>;
  listSemesterRecords(): Promise<TimetableSemesterRecord[]>;
  removeCourse(params: {
    courseId: string;
    semesterId: string;
  }): Promise<TimetableSemesterRecord | null>;
}
