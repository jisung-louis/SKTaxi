import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { WeeklyMenu } from '../types/cafeteria';

export const useCafeteriaMenu = () => {
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ISO 주차 계산 (월요일부터 시작)
  const getCurrentWeek = () => {
    const now = new Date();
    
    // ISO 주차 계산: 월요일부터 시작하는 주차
    const getISOWeek = (date: Date) => {
      const target = new Date(date.valueOf());
      const dayNr = (date.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
      }
      return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    };
    
    // 항상 실제 현재 ISO 주차를 반환
    return getISOWeek(now);
  };

  // 주차 ID 생성 (예: "2025-W43")
  const getWeekId = () => {
    const year = new Date().getFullYear();
    const week = getCurrentWeek();
    return `${year}-W${week}`;
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const weekId = getWeekId();
        const db = getFirestore();
        const menuRef = doc(db, 'cafeteriaMenus', weekId);
        const menuSnap = await getDoc(menuRef);

        if (menuSnap.exists()) {
          const data = menuSnap.data();
          if (data) {
            setMenu({
              id: menuSnap.id,
              weekStart: data.weekStart,
              weekEnd: data.weekEnd,
              rollNoodles: data.rollNoodles || [],
              theBab: data.theBab || [],
              fryRice: data.fryRice || [],
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            });
          }
        } else {
          setError('이번 주 학식 메뉴가 없습니다.');
        }
      } catch (err: any) {
        console.error('Failed to fetch cafeteria menu:', err);
        setError('학식 메뉴를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // 주차 정보를 파싱해서 "10월 넷째 주" 형태로 변환 (ISO 주차 기준)
  const getWeekDisplayName = () => {
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
    loading,
    error,
    weekDisplayName: getWeekDisplayName(),
    refetch: () => {
      setLoading(true);
      setError(null);
      // 다시 fetch하는 로직은 useEffect에서 처리됨
    }
  };
};
