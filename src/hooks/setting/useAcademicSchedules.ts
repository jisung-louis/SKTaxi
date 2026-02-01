// SKTaxi: 학사일정 조회 훅 (Repository 패턴)
// 레거시 훅(src/hooks/useAcademicSchedules.ts)의 전체 기능을 DIP 원칙에 맞게 구현

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAcademicRepository } from '../../di/useRepository';
import { AcademicSchedule, AcademicScheduleWithColor, ScheduleMessage } from '../../types/academic';
import { ACADEMIC_SCHEDULE_COLORS, assignColor } from '../../constants/colorPalettes';
import {
  normalizeDate,
  normalizeDateObject,
  isDateAfterOrEqual,
  isDateBeforeOrEqual,
  isDateRangeOverlapping,
} from '../../utils/dateUtils';

export interface UseAcademicSchedulesResult {
  /** 모든 학사일정 (컬러 할당됨) */
  schedules: AcademicScheduleWithColor[];
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 특정 월의 일정 가져오기 */
  getSchedulesForMonth: (year: number, month: number) => AcademicScheduleWithColor[];
  /** 특정 주의 일정 가져오기 */
  getSchedulesForWeek: (date: Date) => AcademicScheduleWithColor[];
  /** 오늘 기준 일정 메시지 생성 (단일 메시지) */
  getTodayScheduleMessage: () => ScheduleMessage | null;
  /** 추가 메시지 생성 (14일 이내 주요 일정 중 가장 가까운 것) */
  getAdditionalScheduleMessage: () => ScheduleMessage | null;
  /** 다시 불러오기 */
  refetch: () => void;
}

/**
 * 학사일정 조회 훅 (Repository 패턴)
 *
 * 레거시 훅의 전체 기능을 포함하며 DIP 원칙을 준수합니다.
 * Firebase 직접 접근 대신 IAcademicRepository를 통해 데이터를 조회합니다.
 */
export function useAcademicSchedules(): UseAcademicSchedulesResult {
  const academicRepository = useAcademicRepository();

  const [rawSchedules, setRawSchedules] = useState<AcademicSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await academicRepository.getSchedules();
      setRawSchedules(result);
    } catch (err: any) {
      console.error('학사일정 조회 실패:', err);
      setError('학사일정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [academicRepository]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // 일정에 컬러 할당
  const schedules = useMemo<AcademicScheduleWithColor[]>(() => {
    return rawSchedules.map((schedule, index) => ({
      ...schedule,
      color: assignColor(index, ACADEMIC_SCHEDULE_COLORS),
    }));
  }, [rawSchedules]);

  // 특정 월의 일정 가져오기
  const getSchedulesForMonth = useCallback(
    (year: number, month: number): AcademicScheduleWithColor[] => {
      return schedules.filter((schedule) => {
        const scheduleDate = normalizeDate(schedule.startDate);
        return scheduleDate.getFullYear() === year && scheduleDate.getMonth() === month - 1;
      });
    },
    [schedules]
  );

  // 특정 주의 일정 가져오기
  const getSchedulesForWeek = useCallback(
    (date: Date): AcademicScheduleWithColor[] => {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return schedules.filter((schedule) => {
        return isDateRangeOverlapping(schedule.startDate, schedule.endDate, startOfWeek, endOfWeek);
      });
    },
    [schedules]
  );

  // 오늘 기준 일정 메시지 생성 (단일 메시지)
  const getTodayScheduleMessage = useCallback((): ScheduleMessage | null => {
    const today = new Date();
    const todayNormalized = normalizeDateObject(today);

    // 오늘 일정 찾기 (날짜만 비교)
    const todaySchedules = schedules.filter((schedule) => {
      return (
        isDateAfterOrEqual(todayNormalized, schedule.startDate) &&
        isDateBeforeOrEqual(todayNormalized, schedule.endDate)
      );
    });

    if (todaySchedules.length === 0) {
      // 오늘 일정이 없으면 가장 가까운 일정 찾기
      const upcomingSchedules = schedules
        .filter((schedule) => {
          const scheduleDate = normalizeDate(schedule.startDate);
          return scheduleDate > todayNormalized;
        })
        .sort((a, b) => normalizeDate(a.startDate).getTime() - normalizeDate(b.startDate).getTime());

      if (upcomingSchedules.length > 0) {
        const nextSchedule = upcomingSchedules[0];
        const scheduleDate = normalizeDate(nextSchedule.startDate);
        const daysLeft = Math.ceil(
          (scheduleDate.getTime() - todayNormalized.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          type: 'upcoming',
          title: `${daysLeft}일 후 ${nextSchedule.title}${nextSchedule.type === 'multi' ? ' 기간이 시작돼요!' : ' 날이에요!'}`,
          description: nextSchedule.description,
          color: nextSchedule.color,
          daysLeft,
        };
      }
      return null;
    }

    const schedule = todaySchedules[0]; // 우선순위가 높은 일정 선택
    const normalizedStartDate = normalizeDate(schedule.startDate);
    const normalizedEndDate = normalizeDate(schedule.endDate);
    const isFirstDay = todayNormalized.getTime() === normalizedStartDate.getTime();
    const isLastDay = todayNormalized.getTime() === normalizedEndDate.getTime();
    const isMultiDay = schedule.type === 'multi';

    if (!isMultiDay) {
      // 단일일 일정
      return {
        type: 'today_single',
        title: `오늘은 ${schedule.title} 날이에요!`,
        description: schedule.description,
        color: schedule.color,
      };
    } else if (isFirstDay) {
      // 여러일 일정의 첫날
      const daysLeft = Math.ceil(
        (normalizedEndDate.getTime() - todayNormalized.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        type: 'today_first',
        title: `오늘은 ${schedule.title} 첫 날이에요!`,
        subtitle: `${schedule.title} 기간이 ${daysLeft}일 남았어요.`,
        description: schedule.description,
        color: schedule.color,
        daysLeft,
      };
    } else if (isLastDay) {
      // 여러일 일정의 마지막날
      return {
        type: 'today_last',
        title: `오늘이 ${schedule.title} 마지막 날이에요!`,
        subtitle: '서두르세요!',
        description: schedule.description,
        color: schedule.color,
      };
    } else {
      // 여러일 일정의 중간날
      const daysLeft = Math.ceil(
        (normalizedEndDate.getTime() - todayNormalized.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        type: 'today_middle',
        title: `오늘은 ${schedule.title} 기간이에요!`,
        subtitle: `${schedule.title} 기간이 ${daysLeft}일 남았어요.`,
        description: schedule.description,
        color: schedule.color,
        daysLeft,
      };
    }
  }, [schedules]);

  // 추가 메시지 생성 (14일 이내 주요 일정 중 가장 가까운 것)
  const getAdditionalScheduleMessage = useCallback((): ScheduleMessage | null => {
    const today = new Date();
    const todayNormalized = normalizeDateObject(today);

    // 14일 이내 주요 일정들 찾기 (날짜만 비교)
    const upcomingPrioritySchedules = schedules
      .filter((schedule) => {
        const scheduleDateNormalized = normalizeDate(schedule.startDate);
        const daysDiff = Math.ceil(
          (scheduleDateNormalized.getTime() - todayNormalized.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff > 0 && daysDiff <= 14 && schedule.isPrimary === true;
      })
      .sort((a, b) => normalizeDate(a.startDate).getTime() - normalizeDate(b.startDate).getTime());

    if (upcomingPrioritySchedules.length > 0) {
      const nextSchedule = upcomingPrioritySchedules[0];
      const scheduleDateNormalized = normalizeDate(nextSchedule.startDate);
      const daysLeft = Math.ceil(
        (scheduleDateNormalized.getTime() - todayNormalized.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        type: 'upcoming',
        title: `${daysLeft}일 후 ${nextSchedule.title}${nextSchedule.type === 'multi' ? ' 기간이 시작돼요!' : ' 날이에요!'}`,
        description: nextSchedule.description,
        color: nextSchedule.color,
        daysLeft,
      };
    }

    return null;
  }, [schedules]);

  return {
    schedules,
    loading,
    error,
    getSchedulesForMonth,
    getSchedulesForWeek,
    getTodayScheduleMessage,
    getAdditionalScheduleMessage,
    refetch: fetchSchedules,
  };
}
