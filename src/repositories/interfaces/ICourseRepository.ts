// SKTaxi: Course Repository 인터페이스 - DIP 원칙 적용
// 수업 데이터 접근을 추상화하여 테스트 용이성 확보

import { Course } from '../../types/timetable';

/**
 * Course Repository 인터페이스
 * Firestore 구현체와 Mock 구현체가 이 인터페이스를 따름
 */
export interface ICourseRepository {
  /**
   * 특정 학기의 모든 수업 조회
   * @param semester - 학기 (예: '2025-1')
   * @returns 수업 목록
   */
  getCoursesBySemester(semester: string): Promise<Course[]>;

  /**
   * 검색어로 수업 검색
   * @param semester - 학기
   * @param searchTerm - 검색어 (수업명, 교수명 등)
   * @returns 검색된 수업 목록
   */
  searchCourses(semester: string, searchTerm: string): Promise<Course[]>;

  /**
   * 특정 수업 조회
   * @param courseId - 수업 ID
   * @returns 수업 데이터 또는 null
   */
  getCourse(courseId: string): Promise<Course | null>;
}
