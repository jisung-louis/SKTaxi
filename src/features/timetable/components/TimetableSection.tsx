import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typhograpy';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { DAY_CELL_HEIGHT } from '@/constants/constants';

import { useTimetable } from '../hooks/useTimetable';
import { TimableViewMode, TimetableCourse } from '../model/types';
import {
  arrangeBlocksInRows,
  coursesToTimetableBlocks,
  generatePeriods,
  getCurrentAcademicWeek,
  getCurrentSemester,
  getCurrentTimeInfo,
  getPeriodTimeInfo,
  getWeekdayName,
} from '../services/timetableUtils';
import { TimetableGrid } from './TimetableGrid';

const DAYCELL_WIDTH = ( WINDOW_WIDTH - ( (20 * 2) + 32) ) / 5
const TODAY_CELL_HEIGHT = 36;
const TODAY_CELL_MARGIN_BOTTOM = 12;

export const TimetableSection = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const currentSemester = getCurrentSemester();
  const currentAcademicWeek = getCurrentAcademicWeek();
  const { courses, loading, getTodayCourses } = useTimetable(currentSemester);
  const [viewMode, setViewMode] = useState<TimableViewMode>('today');
      
  // 오늘 야간수업이 있는지 확인하여 기본값 설정
  const todayCourses = getTodayCourses() || [];
  const hasTodayNightClasses = todayCourses.some(course => 
    course.schedule.some(schedule => schedule.endPeriod >= 10)
  );
  const [showNightClasses, setShowNightClasses] = useState(hasTodayNightClasses);

  // hasTodayNightClasses가 변경될 때마다 showNightClasses 업데이트
  useEffect(() => {
    setShowNightClasses(hasTodayNightClasses);
  }, [hasTodayNightClasses]);

  const handleViewAll = () => {
    navigation.navigate('TimetableDetail');
  };

  // 전체 시간표 그리드 렌더링
  const renderTimetableGrid = () => {
    return <TimetableGrid courses={courses} paddingHorizontal={20} />;
  };

  // 오늘 시간표 그리드 렌더링 (오늘 요일만)
  const renderCourseBlock = (block: any, isInClass: boolean, blockPeriodLength: number) => {
    const blockStyle = {
      backgroundColor: block.course.color || COLORS.accent.blue,
      height: (() => {
        // showNightClasses가 false일 때 주간/야간에 걸친 수업의 높이 조정
        if (!showNightClasses && block.endPeriod >= 10) {
          // 야간 부분을 제외하고 주간 부분만의 높이 계산 (최대 9교시까지)
          const visibleEndPeriod = Math.min(block.endPeriod, 9);
          const visibleStartPeriod = Math.max(block.startPeriod, 1);

          const visiblePeriodLength = visibleEndPeriod - visibleStartPeriod + 1;

          return visiblePeriodLength * TODAY_CELL_HEIGHT + ((visiblePeriodLength - 1) * TODAY_CELL_MARGIN_BOTTOM);
        }
        // 일반적인 경우
        return blockPeriodLength * TODAY_CELL_HEIGHT + ((blockPeriodLength - 1) * TODAY_CELL_MARGIN_BOTTOM);
      })(),
      padding: isInClass ? 10 : 12,
    };

    // 교시 수에 따른 UI 분기
    if (blockPeriodLength === 1 || blockStyle.height === TODAY_CELL_HEIGHT) {
      // 1교시: 교시명, 위치만 표시
      return (
        <View style={[styles.todayCourseBlock, isInClass && styles.inClassCourseBlock, blockStyle, { alignItems: 'center', justifyContent: 'center', paddingVertical: 0 }]}>
          <View style={[styles.courseHeader, {marginBottom: 0}]}>
            <View style={styles.courseHeaderRow}>
              <Text style={[styles.courseName, {flex: 2, marginRight: 2}]} numberOfLines={1}>
                {block.course.name}
              </Text>
              {block.course.location && (
                <Text style={[styles.courseBodyText, {flex: 1}]} numberOfLines={1}>
                  {block.course.location}
                </Text>
              )}
            </View>
            <View style={styles.courseBadgeContainer}>
              {isInClass && (
                <View style={styles.inClassBadge}>
                  <Text style={styles.inClassBadgeText}>수업중</Text>
                </View>
              )}
              <View style={styles.courseBadge}>
                <Text style={styles.courseBadgeText}>
                  {block.course.category.slice(0, 2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      // 2교시 이상: 모든 정보 표시
      return (
        <View style={[styles.todayCourseBlock, isInClass && styles.inClassCourseBlock, blockStyle]}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseName} numberOfLines={blockPeriodLength < 3 ? 1 : 2}>
              {block.course.name}
            </Text>
            <View style={styles.courseBadgeContainer}>
              {isInClass && (
                <View style={styles.inClassBadge}>
                  <Text style={styles.inClassBadgeText}>수업중</Text>
                </View>
              )}
              <View style={styles.courseBadge}>
                <Text style={styles.courseBadgeText}>
                  {block.course.category.slice(0, 2)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.courseBody}>
            <View style={styles.courseBodyRow}>
              <Icon name="location-sharp" size={14} color={COLORS.text.buttonText}/>
              <Text style={styles.courseBodyText} numberOfLines={1}>
                {block.course.location}
              </Text>
            </View>
            {block.course.professor && (
              <View style={styles.courseBodyRow}>
                <Icon name="person-sharp" size={14} color={COLORS.text.buttonText}/>
                <Text style={styles.courseBodyText} numberOfLines={1}>
                  {block.course.professor} 교수
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }
  };

  const renderTodayGrid = () => {
    const today = new Date();
    const todayDayOfWeek = today.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    const periods = generatePeriods();
    const currentTimeInfo = getCurrentTimeInfo();
    
    // 오늘 수업 목록 가져오기
    const todayCourses = getTodayCourses() || [];
    
    // 오늘 수업이 없으면 빈 그리드 표시
    if (todayCourses.length === 0) {
      // todayDayOfWeek가 0 또는 6인지 확인
      const isWeekend = (todayDayOfWeek as number) === 0 || (todayDayOfWeek as number) === 6;
      const weekendMessage = isWeekend ? '주말에는 휴식을 취하세요! 😊' : '꿀 같은 공강을 즐기세요! 😊';
      return (
        <View style={styles.todayGridContainer}>
          <View style={styles.weekendContainer}>
            <Icon name="calendar-outline" size={48} color={COLORS.text.secondary} />
            <Text style={styles.weekendTitle}>오늘은 수업이 없어요</Text>
            <Text style={styles.weekendSubtext}>{weekendMessage}</Text>
          </View>
        </View>
      );
    }

    // 수업을 시간표 블록으로 변환
    const timetableBlocks = coursesToTimetableBlocks(courses as TimetableCourse[]);
    const arrangedBlocks = arrangeBlocksInRows(timetableBlocks);

    return (
      <View style={styles.todayGridContainer}>
        {/* 오늘 날짜 헤더 */}
        <View style={styles.todayHeader}>
          <View style={styles.todayDateInfo}>
            <Text style={styles.todayDateText}>
              {today.getMonth() + 1}월 {today.getDate()}일
            </Text>
            <Text style={styles.todayDayText}>{getWeekdayName(todayDayOfWeek)}요일</Text>
          </View>
          <Text style={styles.todayWeekText}>{currentAcademicWeek}주차</Text>
        </View>

        {/* 시간표 그리드 */}
        <View style={styles.todayGridBody}>
          {periods
            .filter(period => showNightClasses || period < 10) // 야간수업 숨김/표시 필터링
            .map((period) => {
            const periodTime = getPeriodTimeInfo(period);
            const isNightClass = period >= 10;
            const block = arrangedBlocks.find((b: any) => 
              b.dayOfWeek === todayDayOfWeek && b.startPeriod === period
            );
            const isCurrentPeriod = currentTimeInfo.currentPeriod === period;
            const blockPeriodLength = block ? block.endPeriod - block.startPeriod + 1 : 0;
            
            // 현재 교시가 수업 시간 범위에 포함되는지 확인
            // 현재 교시가 수업의 시작~종료 교시 범위에 포함되는지 체크
            const isInClass = block && 
              currentTimeInfo.currentPeriod >= block.startPeriod && 
              currentTimeInfo.currentPeriod <= block.endPeriod;
            
            return (
              <View key={period} style={styles.todayPeriodRow}>
                {/* 교시 정보 */}
                <View style={[
                  styles.periodColumn,
                  isCurrentPeriod && styles.currentPeriodColumn
                ]}>
                  <View style={styles.periodNumberContainer}>
                    {isNightClass && <Icon name="moon-outline" size={8} color={COLORS.accent.orange} />}
                    <Text style={[
                      styles.periodNumber,
                      isCurrentPeriod && styles.currentPeriodNumber
                    ]} numberOfLines={1}>
                      {period}교시
                    </Text>
                  </View>
                  <Text style={[
                    styles.periodTime,
                    isCurrentPeriod && styles.currentPeriodTime
                  ]} numberOfLines={1}>
                    {periodTime.startTime} - {periodTime.endTime}
                  </Text>
                </View>
                
                {/* 수업 블록 */}
                <View style={styles.todayCourseColumn}>
                  {block ? (
                    renderCourseBlock(block, !!isInClass, blockPeriodLength)
                  ) : (
                    <View style={styles.todayEmptyCell}>
                      <Text style={styles.emptyCellText}>-</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.moreButtonContainer}>
          <TouchableOpacity style={styles.moreButton} onPress={() => setShowNightClasses(!showNightClasses)}>
            <Text style={styles.moreButtonText}>{showNightClasses ? "야간수업 숨기기" : "야간수업 펼치기"}</Text>
            <Icon name={showNightClasses ? "chevron-up" : "chevron-down"} size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="calendar" size={20} color={COLORS.accent.blue} />
            <Text style={styles.sectionTitle}>내 시간표</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.accent.blue} />
          <Text style={styles.loadingText}>시간표를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
            <Icon name="calendar" size={20} color={COLORS.accent.blue} />
            <Text style={styles.sectionTitle}>내 시간표</Text>
        </View>
        <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
            <Text style={styles.viewAllText}>시간표 편집</Text>
            <Icon name="chevron-forward" size={16} color={COLORS.accent.green} />
        </TouchableOpacity>
      </View>

      {/* 뷰 모드 토글 */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity 
          style={[styles.viewModeButton, viewMode === 'today' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('today')}
        >
          <Text style={[styles.viewModeText, viewMode === 'today' && styles.viewModeTextActive]}>
            오늘 시간표
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>
            전체 시간표
          </Text>
        </TouchableOpacity>
      </View>
      
      { viewMode === 'today' ? renderTodayGrid() : renderTimetableGrid() }
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
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
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
    elevation: 1,
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
  timetableCard: {
    borderRadius: 16,
    backgroundColor: COLORS.background.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.dark,
  },
  timetableRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  timetableTime: {
    width: 56,
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  timetableCourse: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  weekView: {
    gap: 8,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  courseBlockText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.buttonText,
    fontWeight: '600',
    textAlign: 'center',
  },
  courseBlockTime: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.buttonText,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 2,
  },
  emptyDay: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDayText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  viewAllText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  // 새로운 그리드 스타일
  gridContainer: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.dark,
  },
  gridHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.dark,
  },
  timeColumn: {
    width: 31,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.dark,
    justifyContent: 'center',
  },
  timeHeaderText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  dayColumn: {
    width: DAYCELL_WIDTH,
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.dark,
  },
  dayHeaderText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  gridBody: {
    minWidth: 400,
  },
  timeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.dark,
  },
  timeCell: {
    width: 31,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.dark,
    justifyContent: 'center',
  },
  timeText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  dayCell: {
    width: DAYCELL_WIDTH,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.dark,
    height: DAY_CELL_HEIGHT,
  },
  courseBlock: {
    position: 'absolute',
    paddingVertical: 6,
    paddingHorizontal: 2,
    left: 0,
    right: 0,
    borderRadius: 6,
    zIndex: 1000,
    margin: 2,
  },
  courseText: {
    ...TYPOGRAPHY.caption3,
    color: COLORS.text.buttonText,
    fontWeight: '600',
    textAlign: 'center',
  },
  courseLocation: {
    ...TYPOGRAPHY.caption3,
    color: COLORS.text.buttonText,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 1,
  },
  emptyCell: {
    flex: 1,
    minHeight: DAY_CELL_HEIGHT,
  },
  // 오늘 시간표 전용 스타일
  todayGridContainer: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.dark,
    overflow: 'hidden',
    marginBottom: 12,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.dark,
  },
  todayDateInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
    alignItems: 'flex-end',
  },
  todayDateText: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  todayDayText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  todayWeekText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  todayGridBody: {
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  todayPeriodRow: {
    flexDirection: 'row',
    marginBottom: TODAY_CELL_MARGIN_BOTTOM,
    alignItems: 'flex-start',
    gap: 8,
  },
  periodColumn: {
    width: 76,
    height: TODAY_CELL_HEIGHT,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border.dark,
  },
  currentPeriodColumn: {
    backgroundColor: COLORS.accent.blue + '20',
    borderColor: COLORS.accent.blue,
    borderWidth: 2,
  },
  currentPeriodNumber: {
    color: COLORS.accent.blue,
    fontWeight: '700',
  },
  currentPeriodTime: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  periodNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  periodNumber: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  periodTime: {
    ...TYPOGRAPHY.caption3,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  todayCourseColumn: {
    flex: 1,
  },
  todayCourseBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  inClassCourseBlock: {
    borderColor: COLORS.accent.blue,
    borderWidth: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseHeaderRow: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 4,
    alignItems: 'flex-end',
  },
  courseBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inClassBadge: {
    backgroundColor: COLORS.accent.blue,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  inClassBadgeText: {
    ...TYPOGRAPHY.caption3,
    color: COLORS.text.white,
    fontWeight: '700',
  },
  courseName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.buttonText,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  courseBadge: {
    backgroundColor: COLORS.text.buttonText + '20',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  courseBadgeText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.buttonText,
    fontWeight: '600',
  },
  courseBody: {
    flexDirection: 'column',
    gap: 4,
  },
  courseBodyRow: {
    flexDirection: 'row',
    gap: 4,
    opacity: 0.8,
  },
  courseBodyText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.buttonText,
    fontWeight: '400',
    flex: 1,
  },
  todayEmptyCell: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 10,
    padding: 10,
    height: TODAY_CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.dark,
    borderStyle: 'dashed',
  },
  emptyCellText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  weekendContainer: {
    alignItems: 'center',
    padding: 40,
  },
  weekendTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  weekendSubtext: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  moreButtonContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  moreButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  gridFooter: {
    backgroundColor: COLORS.background.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.dark,
    padding: 10,
  },
  gridFooterText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  footerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerHeaderText: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  footerCourseItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.dark,
  },
  footerCourseName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  footerCourseInfo: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  footerCourseDetail: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
});
