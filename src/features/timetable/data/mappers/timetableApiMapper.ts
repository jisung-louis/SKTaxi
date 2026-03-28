import type {
  CourseScheduleDto,
  CourseSummaryDto,
  TimetableCourseDto,
  UserTimetableDto,
} from '../dto/timetableDto';
import type {
  TimetableCatalogCourseRecord,
  TimetableCourseRecord,
  TimetableSemesterRecord,
} from '../../model/timetableDetailSource';
import type {
  TimetableCourseToneId,
  TimetableWeekdayId,
} from '../../model/timetableDetailViewData';

const WEEKDAY_BY_NUMBER: Record<number, TimetableWeekdayId> = {
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

const FALLBACK_TONE_ORDER: TimetableCourseToneId[] = [
  'green',
  'blue',
  'pink',
  'yellow',
  'purple',
  'teal',
  'orange',
  'red',
];

const hashString = (value: string) =>
  Array.from(value).reduce((hash, char) => {
    return Math.abs(hash * 31 + char.charCodeAt(0));
  }, 0);

const toWeekdayId = (dayOfWeek: number): TimetableWeekdayId => {
  return WEEKDAY_BY_NUMBER[dayOfWeek] ?? 'mon';
};

const toCurrentWeekdayId = (): TimetableWeekdayId => {
  const today = new Date().getDay();

  if (today === 0) {
    return 'mon';
  }

  return toWeekdayId(today);
};

const toToneId = ({
  courseId,
  toneMap,
}: {
  courseId: string;
  toneMap: Record<string, TimetableCourseToneId>;
}): TimetableCourseToneId => {
  const storedTone = toneMap[courseId];

  if (storedTone) {
    return storedTone;
  }

  return FALLBACK_TONE_ORDER[
    hashString(courseId) % FALLBACK_TONE_ORDER.length
  ];
};

const mapScheduleRecord = (schedule: CourseScheduleDto) => ({
  day: toWeekdayId(schedule.dayOfWeek),
  startPeriod: schedule.startPeriod,
  endPeriod: schedule.endPeriod,
});

const mapTimetableCourseDto = ({
  course,
  toneMap,
}: {
  course: TimetableCourseDto;
  toneMap: Record<string, TimetableCourseToneId>;
}): TimetableCourseRecord => ({
  code: course.code,
  credits: course.credits,
  id: course.id,
  isOnline: course.isOnline,
  locationLabel: course.location ?? undefined,
  name: course.name,
  professor: course.professor?.trim() || '미정',
  schedules: course.schedule.map(mapScheduleRecord),
  toneId: toToneId({
    courseId: course.id,
    toneMap,
  }),
});

export const mapCourseSummaryDtoToCatalogCourseRecord = ({
  course,
  toneMap,
}: {
  course: CourseSummaryDto;
  toneMap: Record<string, TimetableCourseToneId>;
}): TimetableCatalogCourseRecord => ({
  code: course.code,
  credits: course.credits,
  id: course.id,
  isOnline: course.isOnline,
  locationLabel: course.location ?? undefined,
  name: course.name,
  professor: course.professor?.trim() || '미정',
  schedules: course.schedule.map(mapScheduleRecord),
  toneId: toToneId({
    courseId: course.id,
    toneMap,
  }),
});

export const buildTimetableSemesterRecord = ({
  catalogCourses,
  semesterId,
  semesterLabel,
  timetable,
  toneMap,
}: {
  catalogCourses: CourseSummaryDto[];
  semesterId: string;
  semesterLabel?: string;
  timetable: UserTimetableDto;
  toneMap: Record<string, TimetableCourseToneId>;
}): TimetableSemesterRecord => ({
  catalogCourses: catalogCourses.map(course =>
    mapCourseSummaryDtoToCatalogCourseRecord({
      course,
      toneMap,
    }),
  ),
  currentDay: toCurrentWeekdayId(),
  courses: timetable.courses.map(course =>
    mapTimetableCourseDto({
      course,
      toneMap,
    }),
  ),
  id: semesterId,
  label: semesterLabel ?? `${semesterId}학기`,
});
