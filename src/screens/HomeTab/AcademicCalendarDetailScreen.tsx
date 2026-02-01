import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useAcademicSchedules } from '../../hooks/setting';
import { CalendarView, AcademicScheduleWithColor } from '../../types/academic';
import { WeekCalendar } from '../../components/academic/WeekCalendar';
import { MonthCalendar } from '../../components/academic/MonthCalendar';
import PageHeader from '../../components/common/PageHeader';
import { normalizeDate, isSameDate, isDateAfterOrEqual, isDateBeforeOrEqual } from '../../utils/dateUtils';
import { useScreenView } from '../../hooks/useScreenView';

export const AcademicCalendarDetailScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { schedules, loading, error, getTodayScheduleMessage, getSchedulesForMonth } = useAcademicSchedules();
  const [viewMode, setViewMode] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const scheduleRefs = useRef<{ [key: string]: View | null }>({});
  const hasScrolledToSchedule = useRef<boolean>(false);

  // Route params에서 scheduleId와 initialDate 가져오기
  const { scheduleId, initialDate } = (route.params as any) || {};

  // initialDate가 있으면 currentDate 설정
  useEffect(() => {
    if (initialDate) {
      const date = new Date(initialDate);
      setCurrentDate(date);
    }
  }, [initialDate]);

  const todayMessage = getTodayScheduleMessage();
  
  // 현재 월의 일정들 가져오기 (월과 월 사이에 걸친 일정 포함)
  const getCurrentMonthSchedules = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    return schedules.filter(schedule => {
      // 현재 월에 하루라도 걸치는지 확인
      return normalizeDate(schedule.startDate) <= monthEnd && normalizeDate(schedule.endDate) >= monthStart;
    });
  };
  
  const currentMonthSchedules = getCurrentMonthSchedules();
  
  // 일정을 현재/지난 일정으로 분류하고 정렬
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activeSchedules = currentMonthSchedules.filter(schedule => {
    const endDate = new Date(schedule.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  });
  
  const pastSchedules = currentMonthSchedules.filter(schedule => {
    const endDate = new Date(schedule.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

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

  const handleSchedulePress = useCallback((schedule: AcademicScheduleWithColor) => {
    // 해당 일정이 현재 월의 일정 목록에 있는지 확인
    const scheduleIndex = currentMonthSchedules.findIndex(s => s.id === schedule.id);
    if (scheduleIndex !== -1) {
      // 일정 아이템의 ref를 사용하여 정확한 위치로 스크롤
      const scheduleRef = scheduleRefs.current[schedule.id];
      if (scheduleRef && scrollViewRef.current) {
        scheduleRef.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: y - 20, // 약간의 여백 추가
              animated: true
            });
          },
          () => {
            // measureLayout 실패 시 대체 방법
            const calendarHeight = 200;
            const scheduleItemHeight = 80;
            const targetY = calendarHeight + (scheduleIndex * scheduleItemHeight);
            scrollViewRef.current?.scrollTo({
              y: targetY,
              animated: true
            });
          }
        );
      }
    }
  }, [currentMonthSchedules]);

  // scheduleId가 있으면 해당 일정으로 자동 스크롤 (한 번만 실행)
  useEffect(() => {
    if (scheduleId && currentMonthSchedules.length > 0 && !hasScrolledToSchedule.current) {
      const targetSchedule = currentMonthSchedules.find(schedule => schedule.id === scheduleId);
      if (targetSchedule) {
        hasScrolledToSchedule.current = true; // 스크롤 실행 플래그 설정
        // 약간의 지연을 두고 스크롤 (렌더링 완료 후)
        setTimeout(() => {
          handleSchedulePress(targetSchedule);
        }, 500);
      }
    }
  }, [scheduleId, currentMonthSchedules, handleSchedulePress]);

  const handleDatePress = useCallback((date: Date) => {
    // 해당 날짜의 일정들을 찾기
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    
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
    
    // 우선순위에 따라 첫 번째 일정으로 스크롤
    const targetSchedule = sortedSingleSchedules[0] || sortedMultiSchedules[0];
    
    if (targetSchedule) {
      handleSchedulePress(targetSchedule);
    }
  }, [currentMonthSchedules, handleSchedulePress]);

  const formatLabel = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth() + 1;
    const mm = m < 10 ? `0${m}` : `${m}`;
    if (viewMode === 'month') {
      return `${y}.${mm}`;
    }
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
      return `${mmStr}.${ddStr}`;
    };
    return `${fmt(sunday)} ~ ${fmt(saturday)}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={handleBack} title="학사일정" borderBottom />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.blue} />
          <Text style={styles.loadingText}>학사일정을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={handleBack} title="학사일정" borderBottom />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.text.secondary} />
          <Text style={styles.errorText}>학사일정을 불러올 수 없습니다.</Text>
          <Text style={styles.errorSubtext}>잠시 후 다시 시도해주세요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader onBack={handleBack} title="학사일정" borderBottom />

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘 일정 메시지 (오늘 일정이 있을 때만) */}
        {todayMessage && (todayMessage.type === 'today_single' || todayMessage.type === 'today_first' || todayMessage.type === 'today_last' || todayMessage.type === 'today_middle') && (
          <View style={[styles.messageContainer, { borderLeftColor: todayMessage.color }]}>
            <View style={styles.messageHeader}>
              <Icon name="today" size={20} color={todayMessage.color} />
              <Text style={styles.messageLabel}>오늘의 일정</Text>
            </View>
            <Text style={[styles.messageTitle, { color: todayMessage.color }]}>
              {todayMessage.title}
            </Text>
            {todayMessage.subtitle && (
              <Text style={styles.messageSubtitle}>
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

        {/* 캘린더 영역 */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>
              {viewMode === 'week' ? '이번 주 캘린더' : '이번 달 캘린더'}
            </Text>
            <TouchableOpacity style={styles.todayButton} onPress={moveToday}>
              <Text style={styles.todayText}>오늘</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.navRow}>
            <View style={styles.navRowLeft}>
              <TouchableOpacity style={styles.navButton} onPress={movePrev}>
                <Icon name="chevron-back" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.navLabel}>{formatLabel()}</Text>
              <TouchableOpacity style={styles.navButton} onPress={moveNext}>
                <Icon name="chevron-forward" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            {/* 캘린더 모드 토글 */}
            <TouchableOpacity 
              style={styles.calendarModeToggle} 
              onPress={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
            >
              <Text style={styles.calendarModeText}>
                {viewMode === 'week' ? '월간보기' : '주간보기'}
              </Text>
              <Icon 
                name={viewMode === 'week' ? 'calendar' : 'calendar-outline'} 
                size={14} 
                color={COLORS.text.primary} 
              />
            </TouchableOpacity>
          </View>
          {viewMode === 'week' ? (
            <WeekCalendar schedules={schedules} currentDate={currentDate} onDateChange={handleDateChange} onSchedulePress={handleSchedulePress} onDatePress={handleDatePress} />
          ) : (
            <MonthCalendar schedules={schedules} currentDate={currentDate} onDateChange={handleDateChange} onSchedulePress={handleSchedulePress} onDatePress={handleDatePress} />
          )}
        </View>

        {/* 이번 달 일정 목록 */}
        <View style={styles.schedulesContainer}>
          <Text style={styles.schedulesTitle}>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 일정
          </Text>
          {currentMonthSchedules.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={32} color={COLORS.text.secondary} />
              <Text style={styles.emptyText}>이번 달에는 등록된 일정이 없습니다.</Text>
            </View>
          ) : (
            <>
              {/* 현재/예정 일정 */}
              {activeSchedules.length > 0 && (
                <View style={styles.schedulesInnerContainer}>
                  {/* <Text style={styles.sectionTitle}>현재/예정 일정</Text> */}
                  {activeSchedules.map((schedule, index) => (
                    <View 
                      key={schedule.id} 
                      ref={(ref) => { scheduleRefs.current[schedule.id] = ref; }}
                      style={[styles.scheduleItem, { borderLeftColor: schedule.color }]}
                    >
                      <View style={styles.scheduleHeader}>
                        <Text style={[styles.scheduleTitle, { color: schedule.color }]}>
                          {schedule.title}
                        </Text>
                         {schedule.isPrimary && (
                          <View style={[styles.priorityBadge, { backgroundColor: schedule.color }]}>
                            <Text style={styles.priorityText}>
                              중요
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.scheduleDate}>
                        {schedule.type === 'multi' ? `${schedule.startDate} ~ ${schedule.endDate}` : schedule.startDate}
                      </Text>
                      {schedule.description && (
                        <Text style={styles.scheduleDescription}>
                          {schedule.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* 지난 일정 */}
              {pastSchedules.length > 0 && (
                <View style={styles.schedulesInnerContainer}>
                  <Text style={styles.sectionTitle}>지난 일정</Text>
                  {pastSchedules.map((schedule, index) => (
                    <View 
                      key={schedule.id} 
                      ref={(ref) => { scheduleRefs.current[schedule.id] = ref; }}
                      style={[styles.scheduleItem, styles.pastScheduleItem, { borderLeftColor: schedule.color }]}
                    >
                      <View style={styles.scheduleHeader}>
                        <Text style={[styles.scheduleTitle, styles.pastScheduleTitle, { color: schedule.color }]}>
                          {schedule.title}
                        </Text>
                        {schedule.isPrimary && (
                          <View style={[styles.priorityBadge, styles.pastPriorityBadge, { backgroundColor: schedule.color }]}>
                            <Text style={[styles.priorityText, styles.pastPriorityText]}>
                              중요
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.scheduleDate, styles.pastScheduleDate]}>
                        {schedule.type === 'multi' ? `${schedule.startDate} ~ ${schedule.endDate}` : schedule.startDate}
                      </Text>
                      {schedule.description && (
                        <Text style={[styles.scheduleDescription, styles.pastScheduleDescription]}>
                          {schedule.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  errorText: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  errorSubtext: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  messageContainer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  messageLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  messageTitle: {
    ...TYPOGRAPHY.title3,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  messageDescription: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginTop: 12,
  },
  calendarContainer: {
    marginHorizontal: 20, // 16 + 4
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  calendarModeText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 40,
  },
  navRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.dark,
  },
  navButton: {
    padding: 4,
  },
  navLabel: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  todayButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.dark,
  },
  todayText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  schedulesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  schedulesTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 12,
  },
  schedulesInnerContainer: {
    marginBottom: 20,
  },
  scheduleItem: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  priorityText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.buttonText,
    fontWeight: '600',
  },
  scheduleDate: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  scheduleDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  pastScheduleItem: {
    opacity: 0.6,
  },
  pastScheduleTitle: {
    opacity: 0.7,
  },
  pastPriorityBadge: {
    opacity: 0.7,
  },
  pastPriorityText: {
    opacity: 0.8,
  },
  pastScheduleDate: {
    opacity: 0.6,
  },
  pastScheduleDescription: {
    opacity: 0.6,
  },
});
