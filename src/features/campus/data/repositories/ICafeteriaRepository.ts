// SKTaxi: Cafeteria Repository 인터페이스 - DIP 원칙 적용
// 학식 메뉴 데이터 접근 추상화

import type {
  CafeteriaMenuReactionSummary,
  CafeteriaMenuReactionType,
  WeeklyMenu,
} from '../../model/cafeteria';

/**
 * Cafeteria Repository 인터페이스
 */
export interface ICafeteriaRepository {
  /**
   * 특정 주차의 학식 메뉴 조회
   * @param weekId - 주차 ID (예: "2025-W43")
   * @returns 주간 메뉴 또는 null
   */
  getWeeklyMenu(weekId: string): Promise<WeeklyMenu | null>;

  /**
   * 현재 주차의 학식 메뉴 조회
   * @returns 주간 메뉴 또는 null
   */
  getCurrentWeekMenu(): Promise<WeeklyMenu | null>;

  upsertMenuReaction(
    menuId: string,
    reaction: CafeteriaMenuReactionType | null,
  ): Promise<CafeteriaMenuReactionSummary>;
}
