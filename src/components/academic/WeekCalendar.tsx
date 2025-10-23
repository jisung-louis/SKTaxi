import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { AcademicScheduleWithColor } from '../../types/academic';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { isDateRangeOverlapping, normalizeDate, isSameDate } from '../../utils/dateUtils';

interface WeekCalendarProps {
  schedules: AcademicScheduleWithColor[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onSchedulePress?: (schedule: AcademicScheduleWithColor) => void;
  onDatePress?: (date: Date) => void;
}

// WINDOW_WIDTH - (WeekCalendar container paddingHorizontal) - (AcademicCalendarSection containder padding) - (HomeScreen ScrollView ContentContainer paddingHorizontal) / 7 = DATE_CELL_WIDTH
const DATE_CELL_WIDTH = ( WINDOW_WIDTH - (12 * 2) - (16 * 2) - (4 * 2) ) / 7

export const WeekCalendar: React.FC<WeekCalendarProps> = ({ schedules, currentDate = new Date(), onDateChange, onSchedulePress, onDatePress }) => {
  // 현재 주의 일정들 필터링 (색상은 이미 할당됨)
  const getWeekSchedules = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return schedules.filter(schedule => {
      return isDateRangeOverlapping(schedule.startDate, schedule.endDate, startOfWeek, endOfWeek);
    });
  };

  const weekSchedules = getWeekSchedules();
  // 이번 주의 날짜들 계산 (일요일 시작)
  const getWeekDates = () => {
    const dates: Date[] = [];
    // currentDate를 정규화하여 시간대 문제 방지
    const normalizedCurrentDate = normalizeDate(currentDate.toISOString().split('T')[0]);
    const dayOfWeek = normalizedCurrentDate.getDay();
    const diff = -dayOfWeek; // 일요일로 이동
    
    const sunday = new Date(normalizedCurrentDate);
    sunday.setDate(normalizedCurrentDate.getDate() + diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const weekDates = getWeekDates();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 이벤트의 시작 위치와 너비를 계산하는 함수
  const getEventPosition = (schedule: AcademicScheduleWithColor, weekDates: Date[]) => {
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    const scheduleStart = normalizeDate(schedule.startDate);
    const scheduleEnd = normalizeDate(schedule.endDate);
    
    // 이벤트가 주차 내에서 시작하는 날짜 계산
    const eventStartInWeek = scheduleStart > weekStart ? scheduleStart : weekStart;
    const eventEndInWeek = scheduleEnd < weekEnd ? scheduleEnd : weekEnd;
    
    // 주차 내에서의 시작일과 종료일 계산
    const startDayIndex = Math.max(0, Math.floor((eventStartInWeek.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
    const endDayIndex = Math.min(6, Math.floor((eventEndInWeek.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
    
    // single 타입의 경우 1일 너비로 고정
    const duration = schedule.type === 'single' ? 1 : (endDayIndex - startDayIndex + 1);
    
    return {
      left: startDayIndex * DATE_CELL_WIDTH,
      width: duration * DATE_CELL_WIDTH
    };
  };

  // 일정들이 겹치는지 확인하는 함수
  const isOverlapping = (schedule1: AcademicScheduleWithColor, schedule2: AcademicScheduleWithColor) => {
    return isDateRangeOverlapping(schedule1.startDate, schedule1.endDate, schedule2.startDate, schedule2.endDate);
  };

  // 일정들을 row별로 배치하는 함수 (개선된 알고리즘)
  const assignSchedulesToRows = (schedules: AcademicScheduleWithColor[]) => {
    const rows: AcademicScheduleWithColor[][] = [];
    
    // 1. 기간이 긴 일정부터 정렬 (위에 배치)
    const sortedSchedules = [...schedules].sort((a, b) => {
      const durationA = new Date(a.endDate).getTime() - new Date(a.startDate).getTime();
      const durationB = new Date(b.endDate).getTime() - new Date(b.startDate).getTime();
      return durationB - durationA; // 긴 기간부터
    });
    
    sortedSchedules.forEach(schedule => {
      let assignedRow = -1;
      
      // 기존 row들 중에서 겹치지 않는 row 찾기
      for (let i = 0; i < rows.length; i++) {
        // 해당 row의 모든 일정과 겹치지 않는지 확인
        const canFitInRow = rows[i].every(existingSchedule => 
          !isOverlapping(schedule, existingSchedule)
        );
        
        if (canFitInRow) {
          assignedRow = i;
          break;
        }
      }
      
      // 겹치지 않는 row가 없으면 새 row 생성
      if (assignedRow === -1) {
        assignedRow = rows.length;
        rows.push([]);
      }
      
      rows[assignedRow].push(schedule);
    });
    
    return rows;
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => {
          const date = weekDates[index];
          const isToday = isSameDate(date, today);
          
          return (
            <View key={index} style={styles.dayColumn}>
                <Text style={[
                    styles.dayName, 
                    isToday && styles.dayNameToday,
                    index === 0 && styles.sundayText,
                    index === 6 && styles.saturdayText
                ]}>
                    {day}
                </Text>
                <TouchableOpacity 
                  style={[styles.dateCircle, isToday && styles.dateCircleToday]}
                  onPress={() => onDatePress?.(date)}
                  activeOpacity={0.7}
                >
                    <Text style={[
                        styles.dateNumber, 
                        isToday && styles.dateNumberToday,
                        index === 0 && styles.sundayText,
                        index === 6 && styles.saturdayText
                    ]}>
                    {date.getDate()}
                    </Text>
                </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* 일정 라인들 (해당 주차에 일정이 있을 때만) */}
      {weekSchedules.length > 0 && (
        <View style={styles.eventContainer}>
          {assignSchedulesToRows(weekSchedules).map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.eventRow}>
              {row.map((schedule, scheduleIndex) => {
                const position = getEventPosition(schedule, weekDates);
                
                // 지난 일정인지 확인
                const scheduleEndDate = normalizeDate(schedule.endDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPastSchedule = scheduleEndDate < today;
                
                // 이벤트가 두 주 이상에 걸치는지 확인
                const scheduleStart = normalizeDate(schedule.startDate);
                const scheduleEnd = normalizeDate(schedule.endDate);
                const weekStart = weekDates[0];
                const weekEnd = weekDates[6];
                const isMultiWeek = scheduleStart < weekStart || scheduleEnd > weekEnd;
                
                // 시작 주, 중간 주, 종료 주 구분
                const isStartWeek = scheduleStart >= weekStart;
                const isEndWeek = scheduleEnd <= weekEnd;
                
                // borderRadius 계산
                let borderRadiusStyle: any = {};
                if (isMultiWeek) {
                  if (isStartWeek && isEndWeek) {
                    borderRadiusStyle.borderRadius = 8; // 단일 주
                  } else if (isStartWeek) {
                    borderRadiusStyle.borderTopLeftRadius = 8;
                    borderRadiusStyle.borderTopRightRadius = 0;
                    borderRadiusStyle.borderBottomLeftRadius = 8;
                    borderRadiusStyle.borderBottomRightRadius = 0;
                  } else if (isEndWeek) {
                    borderRadiusStyle.borderTopLeftRadius = 0;
                    borderRadiusStyle.borderTopRightRadius = 8;
                    borderRadiusStyle.borderBottomLeftRadius = 0;
                    borderRadiusStyle.borderBottomRightRadius = 8;
                  } else {
                    borderRadiusStyle.borderRadius = 0; // 중간 주: 모든 모서리 직각
                  }
                } else {
                  borderRadiusStyle.borderRadius = 8; // 단일 주: 모든 모서리 둥글게
                }
                
                return (
                  <View key={`schedule-${schedule.id}`} style={styles.eventLineContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.eventLine, 
                        { 
                          backgroundColor: schedule.color,
                          left: position.left + 1,
                          width: position.width - 2,
                          opacity: isPastSchedule ? 0.4 : 1,
                          ...borderRadiusStyle
                        }
                      ]}
                      onPress={() => onSchedulePress?.(schedule)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.eventText,
                        isPastSchedule && styles.eventTextPast
                      ]} numberOfLines={1}>
                        {schedule.title}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 12,
    //gap: 2,
    //container padding + eventline height + gap + dayname textheight + dayname marginBottom + dateCircle + dateCircle marginVertical
    //minHeight: ( 12 * 2 ) + 14 + 2 + 18 + 4 + 32 + (2 * 2),
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNameToday: {
    color: COLORS.accent.green,
    fontWeight: '700',
  },
  sundayText: {
    color: COLORS.accent.red,
  },
  saturdayText: {
    color: COLORS.accent.blue,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  dateCircleToday: {
    backgroundColor: COLORS.accent.green,
  },
  dateNumber: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  dateNumberToday: {
    color: COLORS.text.buttonText,
    fontWeight: '700',
  },
  eventContainer: { //이벤트라인들 사이
    //gap: 16,
  },
  eventRow: {
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 16,
  },
  eventLineContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  eventLine: { //height = 14
    height: 14,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.buttonText,
    fontWeight: '500',
    textAlign: 'center',
  },
  eventTextPast: {
    opacity: 0.6,
  },
});
