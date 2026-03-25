import {createTimetableDetailMockData} from '../../mocks/timetableDetail.mock';
import type {
  TimetableCatalogCourseRecord,
  TimetableCourseRecord,
  TimetableManualCourseDraft,
  TimetableSemesterRecord,
} from '../../model/timetableDetailSource';
import type {TimetableCourseToneId} from '../../model/timetableDetailViewData';
import type {ITimetableDetailRepository} from './ITimetableDetailRepository';

const NETWORK_DELAY_MS = 180;

const wait = async () => {
  await new Promise(resolve => {
    setTimeout(resolve, NETWORK_DELAY_MS);
  });
};

const cloneCourse = (
  course: TimetableCourseRecord | TimetableCatalogCourseRecord,
): TimetableCourseRecord => ({
  ...course,
  schedules: course.schedules.map(schedule => ({...schedule})),
});

const cloneSemester = (semester: TimetableSemesterRecord): TimetableSemesterRecord => ({
  ...semester,
  catalogCourses: semester.catalogCourses.map(course => cloneCourse(course)),
  courses: semester.courses.map(course => cloneCourse(course)),
});

const store = createTimetableDetailMockData().reduce<
  Record<string, TimetableSemesterRecord>
>((accumulator, semester) => {
  accumulator[semester.id] = cloneSemester(semester);
  return accumulator;
}, {});

export class MockTimetableDetailRepository implements ITimetableDetailRepository {
  async listSemesterRecords(): Promise<TimetableSemesterRecord[]> {
    await wait();
    return Object.values(store).map(semester => cloneSemester(semester));
  }

  async getSemesterRecord(
    semesterId: string,
  ): Promise<TimetableSemesterRecord | null> {
    await wait();

    const semester = store[semesterId];
    return semester ? cloneSemester(semester) : null;
  }

  async addCatalogCourse({
    courseId,
    replaceCourseIds = [],
    semesterId,
    toneId,
  }: {
    courseId: string;
    replaceCourseIds?: string[];
    semesterId: string;
    toneId: TimetableCourseToneId;
  }): Promise<TimetableSemesterRecord | null> {
    await wait();

    const semester = store[semesterId];

    if (!semester) {
      return null;
    }

    const catalogCourse = semester.catalogCourses.find(course => course.id === courseId);

    if (!catalogCourse) {
      return cloneSemester(semester);
    }

    if (semester.courses.some(course => course.id === courseId)) {
      return cloneSemester(semester);
    }

    semester.courses = semester.courses
      .filter(course => !replaceCourseIds.includes(course.id))
      .concat({
        ...cloneCourse(catalogCourse),
        toneId,
      });

    return cloneSemester(semester);
  }

  async addManualCourse({
    draft,
    replaceCourseIds = [],
    semesterId,
  }: {
    draft: TimetableManualCourseDraft;
    replaceCourseIds?: string[];
    semesterId: string;
  }): Promise<TimetableSemesterRecord | null> {
    await wait();

    const semester = store[semesterId];

    if (!semester) {
      return null;
    }

    const nextCourse: TimetableCourseRecord = {
      code: `MANUAL-${Date.now().toString().slice(-4)}`,
      credits: draft.credits,
      id: `manual-${Date.now()}`,
      isOnline: draft.isOnline,
      locationLabel: draft.isOnline ? '온라인' : draft.locationLabel,
      name: draft.name,
      professor: draft.professor || '직접 입력',
      schedules: draft.isOnline
        ? []
        : [
            {
              day: draft.day,
              endPeriod: draft.endPeriod,
              startPeriod: draft.startPeriod,
            },
          ],
      toneId: draft.toneId,
    };

    semester.courses = semester.courses
      .filter(course => !replaceCourseIds.includes(course.id))
      .concat(nextCourse);

    return cloneSemester(semester);
  }

  async removeCourse({
    courseId,
    semesterId,
  }: {
    courseId: string;
    semesterId: string;
  }): Promise<TimetableSemesterRecord | null> {
    await wait();

    const semester = store[semesterId];

    if (!semester) {
      return null;
    }

    semester.courses = semester.courses.filter(course => course.id !== courseId);
    return cloneSemester(semester);
  }
}
