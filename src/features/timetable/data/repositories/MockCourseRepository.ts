import type { ICourseRepository } from './ICourseRepository';
import type { Course } from '../../model/types';

const mockCourses: Course[] = [
  {
    id: 'mock-course-1',
    grade: 3,
    category: '전공선택',
    code: 'CS301',
    division: '001',
    name: '모바일 프로그래밍',
    credits: 3,
    professor: '김성결',
    schedule: [{ dayOfWeek: 2, startPeriod: 3, endPeriod: 5 }],
    location: '공학관 302',
    semester: '2026-1',
    department: '컴퓨터공학과',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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
