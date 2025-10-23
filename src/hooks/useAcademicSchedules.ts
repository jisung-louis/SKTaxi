import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, getDocs } from '@react-native-firebase/firestore';
import { AcademicSchedule, AcademicScheduleWithColor, ScheduleMessage } from '../types/academic';
import { normalizeDate, isDateAfterOrEqual, isDateBeforeOrEqual, isDateRangeOverlapping } from '../utils/dateUtils';
import { ACADEMIC_SCHEDULE_COLORS, assignColor } from '../constants/colorPalettes';

export const useAcademicSchedules = () => {
  const [schedules, setSchedules] = useState<AcademicScheduleWithColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);

        const db = getFirestore();
        const schedulesRef = collection(db, 'academicSchedules');
        const q = query(schedulesRef, orderBy('startDate', 'asc'));
        const querySnapshot = await getDocs(q);

        const schedulesData: AcademicSchedule[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          schedulesData.push({
            id: doc.id,
            title: data.title,
            startDate: data.startDate,
            endDate: data.endDate,
            type: data.type,
            isPrimary: data.isPrimary || false,
            description: data.description,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        });

        // 전역 색상 할당 (날짜순으로 순환)
        const schedulesWithColors = schedulesData.map((schedule, index) => ({
          ...schedule,
          color: assignColor(index, ACADEMIC_SCHEDULE_COLORS)
        }));

        setSchedules(schedulesWithColors);
      } catch (err: any) {
        console.error('Failed to fetch academic schedules:', err);
        setError('학사일정을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // 특정 월의 일정 가져오기
  const getSchedulesForMonth = (year: number, month: number) => {
    return schedules.filter(schedule => {
      const scheduleDate = normalizeDate(schedule.startDate);
      return scheduleDate.getFullYear() === year && scheduleDate.getMonth() === month - 1;
    });
  };

  // 특정 주의 일정 가져오기
  const getSchedulesForWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return schedules.filter(schedule => {
      return isDateRangeOverlapping(schedule.startDate, schedule.endDate, startOfWeek, endOfWeek);
    });
  };

  // 오늘 기준 일정 메시지 생성 (단일 메시지)
  const getTodayScheduleMessage = (): ScheduleMessage | null => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 오늘 일정 찾기 (날짜만 비교)
    const todaySchedules = schedules.filter(schedule => {
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return isDateAfterOrEqual(todayDate, schedule.startDate) && isDateBeforeOrEqual(todayDate, schedule.endDate);
    });

    if (todaySchedules.length === 0) {
      // 오늘 일정이 없으면 가장 가까운 일정 찾기 (날짜만 비교)
      const upcomingSchedules = schedules
        .filter(schedule => {
          const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const scheduleDate = normalizeDate(schedule.startDate);
          return scheduleDate > todayDate;
        })
        .sort((a, b) => normalizeDate(a.startDate).getTime() - normalizeDate(b.startDate).getTime());

      if (upcomingSchedules.length > 0) {
        const nextSchedule = upcomingSchedules[0];
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const scheduleDate = normalizeDate(nextSchedule.startDate);
        const daysLeft = Math.ceil((scheduleDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          type: 'upcoming',
          title: `${daysLeft}일 후 ${nextSchedule.title}${nextSchedule.type === 'multi' ? ' 기간이 시작돼요!' : ' 날이에요!'}`,
          description: nextSchedule.description,
          color: nextSchedule.color,
          daysLeft
        };
      }
      return null;
    }

    const schedule = todaySchedules[0]; // 우선순위가 높은 일정 선택
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const normalizedStartDate = normalizeDate(schedule.startDate);
    const normalizedEndDate = normalizeDate(schedule.endDate);
    const isFirstDay = todayDate.getTime() === normalizedStartDate.getTime();
    const isLastDay = todayDate.getTime() === normalizedEndDate.getTime();
    const isMultiDay = schedule.type === 'multi';

    if (!isMultiDay) {
      // 단일일 일정
      return {
        type: 'today_single',
        title: `오늘은 ${schedule.title} 날이에요!`,
        description: schedule.description,
        color: schedule.color
      };
    } else if (isFirstDay) {
      // 여러일 일정의 첫날
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        type: 'today_first',
        title: `오늘은 ${schedule.title} 첫 날이에요!`,
        subtitle: `${schedule.title} 기간이 ${daysLeft}일 남았어요.`,
        description: schedule.description,
        color: schedule.color,
        daysLeft
      };
    } else if (isLastDay) {
      // 여러일 일정의 마지막날
      return {
        type: 'today_last',
        title: `오늘이 ${schedule.title} 마지막 날이에요!`,
        subtitle: '서두르세요!',
        description: schedule.description,
        color: schedule.color
      };
    } else {
      // 여러일 일정의 중간날
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        type: 'today_middle',
        title: `오늘은 ${schedule.title} 기간이에요!`,
        subtitle: `${schedule.title} 기간이 ${daysLeft}일 남았어요.`,
        description: schedule.description,
        color: schedule.color,
        daysLeft
      };
    }
  };

  // 추가 메시지 생성 (14일 이내 주요 일정 중 가장 가까운 것)
  const getAdditionalScheduleMessage = (): ScheduleMessage | null => {
    const today = new Date();
    
    // 14일 이내 주요 일정들 찾기 (날짜만 비교)
    const upcomingPrioritySchedules = schedules
      .filter(schedule => {
        const scheduleDate = new Date(schedule.startDate);
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const scheduleDateOnly = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
        const daysDiff = Math.ceil((scheduleDateOnly.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff > 0 && daysDiff <= 14 && schedule.isPrimary === true;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    if (upcomingPrioritySchedules.length > 0) {
      const nextSchedule = upcomingPrioritySchedules[0];
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const scheduleDate = new Date(nextSchedule.startDate);
      const scheduleDateOnly = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
      const daysLeft = Math.ceil((scheduleDateOnly.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        type: 'upcoming',
        title: `${daysLeft}일 후 ${nextSchedule.title}${nextSchedule.type === 'multi' ? ' 기간이 시작돼요!' : ' 날이에요!'}`,
        description: nextSchedule.description,
        color: nextSchedule.color,
        daysLeft
      };
    }
    
    return null;
  };

  return {
    schedules,
    loading,
    error,
    getSchedulesForMonth,
    getSchedulesForWeek,
    getTodayScheduleMessage,
    getAdditionalScheduleMessage,
    refetch: () => {
      setLoading(true);
      setError(null);
      // 다시 fetch하는 로직은 useEffect에서 처리됨
    }
  };
};
