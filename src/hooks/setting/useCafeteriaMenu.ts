// SKTaxi: 학식 메뉴 조회 훅 (Repository 패턴)

import { useState, useEffect, useCallback } from 'react';
import { useCafeteriaRepository } from '../../di/useRepository';
import { WeeklyMenu, getMenuForDate, getAllMenuItems } from '../../types/cafeteria';

/** 오늘/전체 메뉴 (문자열 배열로 변환된 형태) */
export interface ProcessedMenu {
  id: string;
  weekStart: string;
  weekEnd: string;
  rollNoodles: string[];
  theBab: string[];
  fryRice: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UseCafeteriaMenuResult {
  /** 원본 메뉴 데이터 (날짜별 구조 포함) */
  menu: WeeklyMenu | null;
  /** 오늘 날짜의 메뉴만 */
  menuToday: ProcessedMenu | null;
  /** 모든 날짜의 메뉴 합친 것 (미리보기용) */
  allMenu: ProcessedMenu | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 주차 표시 이름 (예: "10월 넷째 주") */
  weekDisplayName: string;
  /** 현재 날짜 문자열 (YYYY-MM-DD) */
  currentDate: string;
  /** 다시 불러오기 */
  refetch: () => void;
}

/**
 * 학식 메뉴 조회 훅
 */
export function useCafeteriaMenu(): UseCafeteriaMenuResult {
  const cafeteriaRepository = useCafeteriaRepository();

  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await cafeteriaRepository.getCurrentWeekMenu();

      if (result) {
        setMenu(result);
      } else {
        setError('이번 주 학식 메뉴가 없습니다.');
      }
    } catch (err: any) {
      console.error('Failed to fetch cafeteria menu:', err);
      setError('학식 메뉴를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [cafeteriaRepository]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // 현재 날짜를 YYYY-MM-DD 형식으로 반환
  const getCurrentDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 현재 날짜에 맞는 메뉴를 반환하는 함수
  const getMenuForToday = (): ProcessedMenu | null => {
    if (!menu) return null;

    const today = getCurrentDateString();

    return {
      id: menu.id,
      weekStart: menu.weekStart,
      weekEnd: menu.weekEnd,
      rollNoodles: getMenuForDate(menu.rollNoodles, today),
      theBab: getMenuForDate(menu.theBab, today),
      fryRice: getMenuForDate(menu.fryRice, today),
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
    };
  };

  // 모든 날짜의 메뉴를 합쳐서 반환 (미리보기용)
  const getAllMenu = (): ProcessedMenu | null => {
    if (!menu) return null;

    return {
      id: menu.id,
      weekStart: menu.weekStart,
      weekEnd: menu.weekEnd,
      rollNoodles: getAllMenuItems(menu.rollNoodles),
      theBab: getAllMenuItems(menu.theBab),
      fryRice: getAllMenuItems(menu.fryRice),
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
    };
  };

  // 주차 정보를 파싱해서 "10월 넷째 주" 형태로 변환 (ISO 주차 기준)
  const getWeekDisplayName = (): string => {
    if (!menu) return '';

    const weekStart = new Date(menu.weekStart);
    const month = weekStart.getMonth() + 1; // 0-based이므로 +1

    // ISO 주차를 월별 주차로 변환
    const getWeekInMonth = (date: Date) => {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const firstMonday = new Date(firstDayOfMonth);

      // 첫 번째 월요일 찾기
      const firstDayOfWeek = firstDayOfMonth.getDay();
      const daysToMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek;
      firstMonday.setDate(firstDayOfMonth.getDate() + daysToMonday);

      // 해당 날짜가 몇 번째 주인지 계산
      const diffTime = date.getTime() - firstMonday.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weekInMonth = Math.floor(diffDays / 7) + 1;

      return Math.max(1, weekInMonth);
    };

    const weekInMonth = getWeekInMonth(weekStart);
    const weekNames = ['첫째', '둘째', '셋째', '넷째', '다섯째'];
    const weekName = weekNames[Math.min(weekInMonth - 1, 4)] || '넷째';

    return `${month}월 ${weekName} 주`;
  };

  return {
    menu,
    menuToday: getMenuForToday(),
    allMenu: getAllMenu(),
    loading,
    error,
    weekDisplayName: getWeekDisplayName(),
    currentDate: getCurrentDateString(),
    refetch: fetchMenu,
  };
}
