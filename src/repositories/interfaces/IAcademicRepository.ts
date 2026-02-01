// SKTaxi: Academic Repository 인터페이스 - DIP 원칙 적용
// 학사일정 데이터 접근 추상화

import { AcademicSchedule } from '../../types/academic';

/**
 * Academic Repository 인터페이스
 */
export interface IAcademicRepository {
  /**
   * 전체 학사일정 조회
   * @returns 학사일정 배열
   */
  getSchedules(): Promise<AcademicSchedule[]>;

  /**
   * 특정 기간의 학사일정 조회
   * @param startDate - 시작일
   * @param endDate - 종료일
   * @returns 해당 기간의 학사일정 배열
   */
  getSchedulesByDateRange(startDate: Date, endDate: Date): Promise<AcademicSchedule[]>;
}
