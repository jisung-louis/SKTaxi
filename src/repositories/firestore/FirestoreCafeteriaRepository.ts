// SKTaxi: Cafeteria Repository Firestore 구현체

import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { ICafeteriaRepository } from '../interfaces/ICafeteriaRepository';
import { WeeklyMenu } from '../../types/cafeteria';

/**
 * Firestore 기반 Cafeteria Repository 구현체
 */
export class FirestoreCafeteriaRepository implements ICafeteriaRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly menusCollection = 'cafeteriaMenus';

  constructor() {
    this.db = getFirestore();
  }

  async getWeeklyMenu(weekId: string): Promise<WeeklyMenu | null> {
    const menuRef = doc(this.db, this.menusCollection, weekId);
    const menuSnap = await getDoc(menuRef);

    if (menuSnap.exists()) {
      const data = menuSnap.data();
      if (data) {
        return {
          id: menuSnap.id,
          weekStart: data.weekStart,
          weekEnd: data.weekEnd,
          rollNoodles: data.rollNoodles || {},
          theBab: data.theBab || {},
          fryRice: data.fryRice || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }
    }

    return null;
  }

  async getCurrentWeekMenu(): Promise<WeeklyMenu | null> {
    const weekId = this.getCurrentWeekId();
    return this.getWeeklyMenu(weekId);
  }

  // === Private 헬퍼 메서드 ===

  /**
   * ISO 주차 계산 (월요일부터 시작)
   */
  private getISOWeek(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

  /**
   * 현재 주차 ID 생성 (예: "2025-W43")
   */
  private getCurrentWeekId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const week = this.getISOWeek(now);
    return `${year}-W${week}`;
  }
}
