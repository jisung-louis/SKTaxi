import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { AcademicScheduleWithColor } from '../../types/academic';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { isDateRangeOverlapping } from '../../utils/dateUtils';

interface MonthCalendarProps {
  schedules: AcademicScheduleWithColor[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onSchedulePress?: (schedule: AcademicScheduleWithColor) => void;
  onDatePress?: (date: Date) => void;
}
// WINDOW_WIDTH - (MonthCalendar container paddingHorizontal) - (AcademicCalendarSection containder padding) - (HomeScreen ScrollView ContentContainer paddingHorizontal) / 7 = DATE_CELL_WIDTH
const DATE_CELL_WIDTH = ( WINDOW_WIDTH - (12 * 2) - (16 * 2) - (4 * 2) ) / 7

export const MonthCalendar: React.FC<MonthCalendarProps> = ({ schedules, currentDate = new Date(), onDateChange, onSchedulePress, onDatePress }) => {
  // 현재 월의 일정들 필터링 (색상은 이미 할당됨)
  const getMonthSchedules = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startDate);
      return scheduleDate.getFullYear() === year && scheduleDate.getMonth() === month;
    });
  };

  const monthSchedules = getMonthSchedules();
  //console.log('monthSchedules', monthSchedules);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 이번 달의 모든 날짜 계산 (이전/다음 달 날짜 포함)
  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const dates: Date[] = [];
    
    // 이전 달 날짜들 (흐리게 표시)
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      dates.push(date);
    }
    
    // 현재 달 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
    
    // 다음 달 날짜들 (흐리게 표시) - 필요한 만큼만
    const totalCells = dates.length;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) { // 마지막 주가 완전하지 않은 경우에만
      for (let i = 1; i <= remainingCells; i++) {
        dates.push(new Date(year, month + 1, i));
      }
    }
    
    return dates;
  };

  const monthDates = getMonthDates();
  const weeks: Date[][] = [];
  
  // 주 단위로 그룹화 (동적으로)
  for (let i = 0; i < monthDates.length; i += 7) {
    weeks.push(monthDates.slice(i, i + 7));
  }

  // 해당 주차에 일정이 있는지 확인하는 함수
  const getWeekSchedules = (week: Date[]) => {
    const weekStart = week[0];
    const weekEnd = week[6];
    
    // 전체 일정 데이터에서 필터링 (월과 월 사이에 걸친 이벤트 포함)
    return schedules.filter(schedule => {
      return isDateRangeOverlapping(schedule.startDate, schedule.endDate, weekStart, weekEnd);
    });
  };

  // 이벤트의 시작 위치와 너비를 계산하는 함수
  const getEventPosition = (schedule: AcademicScheduleWithColor, week: Date[]) => {
    const weekStart = week[0];
    const weekEnd = week[6];
    const scheduleStart = new Date(schedule.startDate);
    const scheduleEnd = new Date(schedule.endDate);
    
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
    <View style={[styles.container]}>
      {/* 요일 헤더 */}
      <View style={styles.weekDaysHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={[
              styles.weekDayText,
              index === 0 && styles.sundayText,
              index === 6 && styles.saturdayText
            ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => {
          const weekSchedules = getWeekSchedules(week);
          
          return (
            <View key={weekIndex} style={styles.weekContainer}>
              {/* 날짜 셀들 */}
              <View style={styles.dateRow}>
                {week.map((date, dayIndex) => {
                  const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
                  const isSunday = dayIndex === 0;
                  const isSaturday = dayIndex === 6;
                  
                  // 현재 달인지 확인
                  const currentYear = currentDate.getFullYear();
                  const currentMonth = currentDate.getMonth();
                  const isCurrentMonth = date.getFullYear() === currentYear && date.getMonth() === currentMonth;

                  return (
                    <TouchableOpacity 
                      key={dayIndex} 
                      style={styles.dateCell}
                      onPress={() => onDatePress?.(date)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.dateCircle, 
                        isToday && styles.dateCircleToday,
                        !isCurrentMonth && styles.dateCircleOtherMonth
                      ]}>
                        <Text style={[
                          styles.dateText,
                          isToday && styles.dateTextToday,
                          isSunday && styles.sundayText,
                          isSaturday && styles.saturdayText,
                          !isCurrentMonth && styles.dateTextOtherMonth
                        ]}>
                          {date.getDate()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* 일정 라인들 (해당 주차에 일정이 있을 때만) */}
              {weekSchedules.length > 0 && (
                <View style={styles.eventContainer}>
                  {assignSchedulesToRows(weekSchedules).map((row, rowIndex) => (
                    <View key={`row-${rowIndex}`} style={styles.eventRow}>
                      {row.map((schedule, scheduleIndex) => {
                        const position = getEventPosition(schedule, week);
                        
                        // 이벤트가 두 주 이상에 걸치는지 확인
                        const scheduleStart = new Date(schedule.startDate);
                        const scheduleEnd = new Date(schedule.endDate);
                        
                        // 지난 일정인지 확인
                        const scheduleEndDate = new Date(schedule.endDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPastSchedule = scheduleEndDate < today;
                        
                        // 해당 이벤트가 현재 달에 하루라도 걸치는지 확인
                        const currentYear = currentDate.getFullYear();
                        const currentMonth = currentDate.getMonth();
                        const monthStart = new Date(currentYear, currentMonth, 1);
                        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
                        
                        // 날짜만 비교하도록 시간을 0으로 설정
                        const eventStartDate = new Date(scheduleStart.getFullYear(), scheduleStart.getMonth(), scheduleStart.getDate());
                        const eventEndDate = new Date(scheduleEnd.getFullYear(), scheduleEnd.getMonth(), scheduleEnd.getDate());
                        
                        const isEventInCurrentMonth = eventStartDate <= monthEnd && eventEndDate >= monthStart;
                        const isEventOutsideCurrentMonth = !isEventInCurrentMonth;
                        const weekStart = week[0];
                        const weekEnd = week[6];
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
                                  opacity: isPastSchedule ? 0.4 : (isEventOutsideCurrentMonth ? 0.6 : 1),
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
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 12,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.border.light,
    //backgroundColor: 'red',
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  sundayText: {
    color: COLORS.accent.red,
  },
  saturdayText: {
    color: COLORS.accent.blue,
  },
  calendarGrid: { //주차 사이
    gap: 12,
    //backgroundColor: 'blue',
  },
  weekContainer: {//주차 내부의 날짜와 이벤트라인 사이
    minHeight: 52,
    gap: 2,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    paddingHorizontal: 4,
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
  dateCircleOtherMonth: {
    backgroundColor: 'transparent',
  },
  dateTextOtherMonth: {
    color: COLORS.text.secondary,
    opacity: 0.4,
  },
  dateCell: { //height = 36
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleToday: {
    backgroundColor: COLORS.accent.green,
  },
  dateText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  dateTextToday: {
    color: COLORS.text.buttonText,
    fontWeight: '700',
  },
  eventTextPast: {
    opacity: 0.6,
  },
});
