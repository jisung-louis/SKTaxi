import type { ICourseRepository } from './ICourseRepository';
import type { Course } from '../../model/types';
import {createTimetableDetailMockData} from '../../mocks/timetableDetail.mock';

const DAY_OF_WEEK_MAP = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
} as const;

const parseCourseCode = (value: string) => {
  const match = value.match(/^(.*?)\s*\(([^)]+)\)$/);

  return {
    code: match?.[1]?.trim() || value,
    division: match?.[2]?.trim() || '001',
  };
};

const mockCourses: Course[] = createTimetableDetailMockData().flatMap(
  semesterRecord => {
    const toCourse = (
      record: (typeof semesterRecord.courses)[number],
      index: number,
    ): Course => {
      const {code, division} = parseCourseCode(record.code);

      return {
        id: record.id,
        grade: 3,
        category: '전공선택',
        code,
        createdAt: new Date(),
        credits: record.credits,
        department: '컴퓨터공학과',
        division,
        location: record.locationLabel ?? '온라인',
        name: record.name,
        professor: record.professor,
        schedule: record.schedules.map(schedule => ({
          dayOfWeek: DAY_OF_WEEK_MAP[schedule.day],
          endPeriod: schedule.endPeriod,
          startPeriod: schedule.startPeriod,
        })),
        semester: semesterRecord.id,
        updatedAt: new Date(Date.now() + index),
      };
    };

    return [...semesterRecord.catalogCourses, ...semesterRecord.courses].map(
      toCourse,
    );
  },
);

export class MockCourseRepository implements ICourseRepository {
  async getCoursesBySemester(semester: string): Promise<Course[]> {
    return mockCourses.filter(course => course.semester === semester);
  }

  async searchCourses(semester: string, searchTerm: string): Promise<Course[]> {
    const query = searchTerm.trim().toLowerCase();

    return mockCourses.filter(course =>
      course.semester === semester &&
      [course.name, course.professor, course.code].join(' ').toLowerCase().includes(query),
    );
  }

  async getCourse(courseId: string): Promise<Course | null> {
    return mockCourses.find(course => course.id === courseId) ?? null;
  }
}
