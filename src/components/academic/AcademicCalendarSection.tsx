import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useAcademicSchedules } from '../../hooks/useAcademicSchedules';
import { CalendarView, AcademicScheduleWithColor } from '../../types/academic';
import { WeekCalendar } from './WeekCalendar';
import { MonthCalendar } from './MonthCalendar';
import { normalizeDate, isSameDate, isDateAfterOrEqual, isDateBeforeOrEqual } from '../../utils/dateUtils';

export const AcademicCalendarSection = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { schedules, loading, error, getTodayScheduleMessage, getAdditionalScheduleMessage } = useAcademicSchedules();
  const [viewMode, setViewMode] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleViewAll = () => {
    navigation.navigate('AcademicCalendarDetail');
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  // 일정 클릭 핸들러 - AcademicCalendarDetail로 이동하면서 특정 일정으로 스크롤
  const handleSchedulePress = useCallback((schedule: AcademicScheduleWithColor) => {
    navigation.navigate('AcademicCalendarDetail', { 
      scheduleId: schedule.id,
      initialDate: schedule.startDate 
    });
  }, [navigation]);

  // 날짜 클릭 핸들러 - 해당 날짜의 일정 중 우선순위가 높은 것으로 이동
  const handleDatePress = useCallback((date: Date) => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // 현재 월의 일정들 가져오기
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    const currentMonthSchedules = schedules.filter(schedule => {
      return normalizeDate(schedule.startDate) <= monthEnd && normalizeDate(schedule.endDate) >= monthStart;
    });
    
    // 1순위: single 타입 일정 (해당 날짜에만 해당)
    const singleSchedules = currentMonthSchedules.filter(schedule => {
      if (schedule.type !== 'single') return false;
      return isSameDate(schedule.startDate, targetDate);
    });
    
    // 2순위: multi 타입 일정 (해당 날짜를 포함하는 기간)
    const multiSchedules = currentMonthSchedules.filter(schedule => {
      if (schedule.type !== 'multi') return false;
      return isDateAfterOrEqual(targetDate, schedule.startDate) && isDateBeforeOrEqual(targetDate, schedule.endDate);
    });
    
    // 우선순위별로 정렬 (isPrimary가 true인 것부터)
    const sortByPriority = (schedules: AcademicScheduleWithColor[]) => {
      return schedules.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
      });
    };
    
    const sortedSingleSchedules = sortByPriority(singleSchedules);
    const sortedMultiSchedules = sortByPriority(multiSchedules);
    
    // 우선순위에 따라 첫 번째 일정으로 이동
    const targetSchedule = sortedSingleSchedules[0] || sortedMultiSchedules[0];
    
    if (targetSchedule) {
      handleSchedulePress(targetSchedule);
    }
  }, [currentDate, schedules, handleSchedulePress]);

  const movePrev = () => {
    if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - 1);
      setCurrentDate(d);
    }
  };

  const moveNext = () => {
    if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() + 1);
      setCurrentDate(d);
    }
  };

  const moveToday = () => {
    setCurrentDate(new Date());
  };

  const formatLabel = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth() + 1;
    const mm = m < 10 ? `0${m}` : `${m}`;
    if (viewMode === 'month') {
      return `${y}.${mm}`;
    }
    // week label (Sun ~ Sat)
    const dayOfWeek = currentDate.getDay();
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() - dayOfWeek);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    const fmt = (d: Date) => {
      const mm2 = d.getMonth() + 1;
      const dd = d.getDate();
      const mmStr = mm2 < 10 ? `0${mm2}` : `${mm2}`;
      const ddStr = dd < 10 ? `0${dd}` : `${dd}`;
      return `${d.getFullYear()}.${mmStr}.${ddStr}`;
    };
    return `${fmt(sunday)} ~ ${fmt(saturday)}`;
  };

  const todayMessage = getTodayScheduleMessage();
  const additionalMessage = getAdditionalScheduleMessage();
  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="calendar" size={20} color={COLORS.accent.blue} />
            <Text style={styles.sectionTitle}>학사일정</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.accent.blue} />
          <Text style={styles.loadingText}>학사일정을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="calendar" size={20} color={COLORS.accent.blue} />
            <Text style={styles.sectionTitle}>학사일정</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>학사일정을 불러올 수 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon name="calendar" size={20} color={COLORS.accent.blue} />
          <Text style={styles.sectionTitle}>학사일정</Text>
        </View>
        <TouchableOpacity style={styles.sectionActionButton} onPress={handleViewAll}>
          <Text style={styles.sectionAction}>자세히</Text>
          <Icon name="chevron-forward" size={16} color={COLORS.accent.green} />
        </TouchableOpacity>
      </View>

      {/* 뷰 모드 토글 */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity 
          style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('week')}
        >
            <Icon name={viewMode === 'week' ? "calendar-number" : "calendar-number-outline"} size={16} color={COLORS.text.primary} />
            <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>
                작게보기
            </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('month')}
        >
          <Icon name={viewMode === 'month' ? "calendar" : "calendar-outline"} size={16} color={COLORS.text.primary} />
          <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>
            크게보기
          </Text>
        </TouchableOpacity>
      </View>

      {/* 기간 이동 */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navButton} onPress={movePrev}>
          <Icon name="chevron-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navLabel}>{formatLabel()}</Text>
        <TouchableOpacity style={styles.navButton} onPress={moveNext}>
          <Icon name="chevron-forward" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.todayButton} onPress={moveToday}>
          <Text style={styles.todayText}>오늘</Text>
        </TouchableOpacity>
      </View>

      {/* 캘린더 미리보기 */}
      <View style={styles.calendarContainer}>
        {viewMode === 'week' ? (
          <WeekCalendar 
            schedules={schedules} 
            currentDate={currentDate} 
            onDateChange={handleDateChange}
            onSchedulePress={handleSchedulePress}
            onDatePress={handleDatePress}
          />
        ) : (
          <MonthCalendar 
            schedules={schedules} 
            currentDate={currentDate} 
            onDateChange={handleDateChange}
            onSchedulePress={handleSchedulePress}
            onDatePress={handleDatePress}
          />
        )}
      </View>

      {/* 오늘 일정 메시지 */}
      {todayMessage && (
        <View style={[styles.messageContainer, { borderLeftColor: todayMessage.color }]}>
          <Text style={[styles.messageTitle, { color: todayMessage.color }]}>
            {todayMessage.title}
          </Text>
          {todayMessage.subtitle && (
            <Text style={[styles.messageSubtitle, { color: todayMessage.color + 'AA'}]}>
              {todayMessage.subtitle}
            </Text>
          )}
          {todayMessage.description && (
            <Text style={styles.messageDescription}>
              {todayMessage.description}
            </Text>
          )}
        </View>
      )}

      {/* 추가 일정 메시지 */}
      {additionalMessage && (
        <View style={[styles.messageContainer, { borderLeftColor: additionalMessage.color }]}>
          <Text style={[styles.messageTitle, { color: additionalMessage.color }]}>
            {additionalMessage.title}
          </Text>
          {additionalMessage.subtitle && (
            <Text style={[styles.messageSubtitle, { color: additionalMessage.color + 'AA'}]}>
              {additionalMessage.subtitle}
            </Text>
          )}
          {additionalMessage.description && (
            <Text style={styles.messageDescription}>
              {additionalMessage.description}
            </Text>
          )}
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionAction: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  viewModeButton: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewModeButtonActive: {
    backgroundColor: COLORS.background.primary,
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewModeText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  viewModeTextActive: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  calendarContainer: {
    marginBottom: 16,
  },
  messageContainer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    padding: 6,
  },
  navLabel: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  todayButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.dark,
  },
  todayText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  messageTitle: {
    ...TYPOGRAPHY.title3,
  },
  messageSubtitle: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    marginTop: 4,
  },
  messageDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: 16,
  },
});
