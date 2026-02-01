// SKTaxi: Timetable Repository 인터페이스 - 시간표 데이터 접근 추상화

import { Unsubscribe, SubscriptionCallbacks } from '../../api/types';

/**
 * 사용자 시간표
 * userTimetables 컬렉션의 문서 구조를 반영
 */
export interface Timetable {
  userId: string;
  semester: string; // 예: '2025-2'
  courses: string[]; // courseId 배열 (실제 강의 정보는 courses 컬렉션에서 조회)
  updatedAt: Date;
}

/**
 * Timetable Repository 인터페이스
 *
 * 역할:
 * - userTimetables 컬렉션 관리 (courseId 배열만 저장)
 * - 실제 강의 정보는 ICourseRepository에서 조회
 */
export interface ITimetableRepository {
  /**
   * 사용자 시간표 실시간 구독
   * @param userId - 사용자 ID
   * @param semester - 학기 (예: '2025-2')
   * @param callbacks - 콜백
   * @returns 구독 해제 함수
   */
  subscribeToTimetable(
    userId: string,
    semester: string,
    callbacks: SubscriptionCallbacks<Timetable | null>
  ): Unsubscribe;

  /**
   * 시간표의 강의 ID 목록 업데이트
   *
   * 사용 시나리오:
   * - 강의 추가: 기존 배열에 새 courseId 추가
   * - 강의 삭제: 배열에서 courseId 제거
   * - 시간표 저장: courseId 배열 전체 교체
   *
   * @param userId - 사용자 ID
   * @param semester - 학기
   * @param courseIds - 강의 ID 배열
   */
  updateCourseIds(
    userId: string,
    semester: string,
    courseIds: string[]
  ): Promise<void>;
}
