import type {TimetableCourseToneId} from '../../model/timetableDetailViewData';
import type {
  TimetableManualCourseDraft,
  TimetableSemesterRecord,
} from '../../model/timetableDetailSource';
import {getCurrentSemester} from '../../services/timetableUtils';
import {getTimetableCourseToneMap} from '../../services/timetableToneStorage';
import {buildTimetableSemesterRecord} from '../mappers/timetableApiMapper';
import {timetableApiClient, TimetableApiClient} from '../api/timetableApiClient';
import type {CourseSummaryDto} from '../dto/timetableDto';
import type {ITimetableDetailRepository} from './ITimetableDetailRepository';

const COURSE_PAGE_SIZE = 100;

const fetchAllSemesterCourses = async (
  apiClient: TimetableApiClient,
  semesterId: string,
) => {
  const courses: CourseSummaryDto[] = [];
  let page = 0;
  let hasNext = true;

  while (hasNext) {
    const response = await apiClient.getCourses({
      page,
      semester: semesterId,
      size: COURSE_PAGE_SIZE,
    });

    courses.push(...response.data.content);
    hasNext = response.data.hasNext;
    page += 1;
  }

  return courses;
};

export class SpringTimetableDetailRepository implements ITimetableDetailRepository {
  constructor(private readonly apiClient: TimetableApiClient = timetableApiClient) {}

  private async buildSemesterRecord(
    semesterId: string,
    semesterLabel?: string,
  ): Promise<TimetableSemesterRecord> {
    const [timetableResponse, catalogCourses, toneMap] = await Promise.all([
      this.apiClient.getMyTimetable(semesterId),
      fetchAllSemesterCourses(this.apiClient, semesterId),
      getTimetableCourseToneMap(semesterId),
    ]);

    return buildTimetableSemesterRecord({
      catalogCourses,
      semesterId,
      semesterLabel,
      timetable: timetableResponse.data,
      toneMap,
    });
  }

  async listSemesterRecords(): Promise<TimetableSemesterRecord[]> {
    const response = await this.apiClient.getMySemesters();
    const options =
      response.data.length > 0
        ? response.data
        : [
            {
              id: getCurrentSemester(),
              label: `${getCurrentSemester()}학기`,
            },
          ];

    return options.map(option => ({
      catalogCourses: [],
      courses: [],
      currentDay: 'mon',
      id: option.id,
      label: option.label,
    }));
  }

  async getSemesterRecord(
    semesterId: string,
  ): Promise<TimetableSemesterRecord | null> {
    const semestersResponse = await this.apiClient.getMySemesters();
    const semesterOption = semestersResponse.data.find(
      semester => semester.id === semesterId,
    );

    return this.buildSemesterRecord(
      semesterOption?.id ?? semesterId,
      semesterOption?.label ?? `${semesterId}학기`,
    );
  }

  async addCatalogCourse({
    courseId,
    semesterId,
  }: {
    courseId: string;
    semesterId: string;
    toneId: TimetableCourseToneId;
  }): Promise<TimetableSemesterRecord | null> {
    await this.apiClient.addMyCourse({
      courseId,
      semester: semesterId,
    });

    return this.getSemesterRecord(semesterId);
  }

  async addManualCourse({
    draft,
    semesterId,
  }: {
    draft: TimetableManualCourseDraft;
    semesterId: string;
  }): Promise<TimetableSemesterRecord | null> {
    await this.apiClient.addMyManualCourse({
      semester: semesterId,
      name: draft.name.trim(),
      professor: draft.professor.trim(),
      credits: draft.credits,
      isOnline: draft.isOnline,
      locationLabel: draft.isOnline ? null : draft.locationLabel.trim(),
      dayOfWeek: draft.isOnline
        ? null
        : {
            mon: 1,
            tue: 2,
            wed: 3,
            thu: 4,
            fri: 5,
            sat: 6,
          }[draft.day],
      startPeriod: draft.isOnline ? null : draft.startPeriod,
      endPeriod: draft.isOnline ? null : draft.endPeriod,
    });

    return this.getSemesterRecord(semesterId);
  }

  async removeCourse({
    courseId,
    semesterId,
  }: {
    courseId: string;
    semesterId: string;
  }): Promise<TimetableSemesterRecord | null> {
    await this.apiClient.removeMyCourse(courseId, semesterId);
    return this.getSemesterRecord(semesterId);
  }
}
