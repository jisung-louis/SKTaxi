import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { TimetableBlock, Course, CourseSchedule, TimetableCourse } from '../../types/timetable';
import { generatePeriods, getWeekdayName, formatCourseTime, coursesToTimetableBlocks, arrangeBlocksInRows } from '../../utils/timetableUtils';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { DAY_CELL_HEIGHT } from '../../constants/constants';

const TIME_COLUMN_WIDTH = 35;

interface TimetableGridProps {
  courses: Course[];
  selectedCourse?: Course | null;
  paddingHorizontal?: number;
  onBlockPress?: (course: Course) => void;
  onFooterItemPress?: (course: Course) => void;
  showPreview?: boolean; // 미리보기 블록 표시 여부
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  courses,
  selectedCourse,
  paddingHorizontal = 8,
  onBlockPress,
  onFooterItemPress,
  showPreview = false,
}) => {
  const weekdays = [1, 2, 3, 4, 5]; // 월-금
  const saturday = 6; // 토요일
  const periods = generatePeriods();
  const DAYCELL_WIDTH = (WINDOW_WIDTH - ((paddingHorizontal * 2) + 36)) / 5;

  // 토요일 수업 제외한 일반 수업만 필터링
  const regularCourses = courses.filter(course => 
    course.schedule?.every(schedule => schedule.dayOfWeek !== saturday)
  );
  
  // 수업을 시간표 블록으로 변환 (토요일 제외)
  const timetableBlocks = coursesToTimetableBlocks(regularCourses as TimetableCourse[]);
  const arrangedBlocks = arrangeBlocksInRows(timetableBlocks);
  
  // 미리보기용 블록 (별도 처리)
  const previewBlocks = selectedCourse && showPreview ? coursesToTimetableBlocks([{ ...selectedCourse, isPreview: true }]) : [];
  const arrangedPreviewBlocks = arrangeBlocksInRows(previewBlocks);
  
  // 전체 수업 중 토요일 수업 필터링 (미리보기 + 이미 추가된 수업)
  const allSaturdayCourses = [
    ...courses.filter(course => course.schedule?.some(schedule => schedule.dayOfWeek === saturday)),
    ...(selectedCourse && selectedCourse.schedule?.some(schedule => schedule.dayOfWeek === saturday) ? [selectedCourse] : [])
  ];
  // 중복 제거
  const saturdayCourses = Array.from(new Map(allSaturdayCourses.map(course => [course.id, course])).values());
  
  // 시간 정보 없는 수업 필터링 (미리보기 + 이미 추가된 수업)
  const allNoScheduleCourses = [
    ...courses.filter(course => course.schedule === undefined || course.schedule?.length === 0),
    ...(selectedCourse && (selectedCourse.schedule === undefined || selectedCourse.schedule?.length === 0) ? [selectedCourse] : [])
  ];
  // 중복 제거
  const noScheduleCourses = Array.from(new Map(allNoScheduleCourses.map(course => [course.id, course])).values());

  return (
    <View style={styles.gridContainer}>
      {/* 헤더 */}
      <View style={styles.gridHeader}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeHeaderText}>교시</Text>
        </View>
        {weekdays.map(day => (
          <View key={day} style={[styles.dayColumn, {borderRightWidth: day === weekdays.length ? 0 : 1, width: DAYCELL_WIDTH}]}>
            <Text style={styles.dayHeaderText}>{getWeekdayName(day)}</Text>
          </View>
        ))}
      </View>

      {/* 시간표 그리드 */}
      <View style={styles.gridBody}>
        {periods.map((period) => (
          <View key={period} style={[styles.timeRow, { borderBottomWidth: period === periods.length ? 0 : 1 }]}>
            {/* 교시 표시 */}
            <View style={styles.timeCell}>
              <Text style={styles.timeText}>{period}</Text>
            </View>
            
            {/* 요일별 셀 */}
            {weekdays.map(day => {
              // 기존 수업 블록 찾기
              const existingBlock = arrangedBlocks.find(b => 
                b.dayOfWeek === day && b.startPeriod === period
              );
              
              // 미리보기 블록 찾기
              const previewBlock = arrangedPreviewBlocks.find(b => 
                b.dayOfWeek === day && b.startPeriod === period
              );
              
              const BlockComponent = onBlockPress && existingBlock ? TouchableOpacity : View;
              const blockProps = onBlockPress && existingBlock ? {
                onPress: () => onBlockPress(existingBlock.course),
                activeOpacity: 0.8,
              } : {};

              return (
                <View key={`${day}-${period}`} style={[styles.dayCell, {borderRightWidth: day === weekdays.length ? 0 : 1, width: DAYCELL_WIDTH}]}>
                  {/* 기존 수업 블록 */}
                  {existingBlock && (
                    <BlockComponent 
                      style={[
                        styles.courseBlock, 
                        { 
                          backgroundColor: existingBlock.course.color || COLORS.accent.blue,
                          height: (existingBlock.endPeriod - existingBlock.startPeriod + 1) * DAY_CELL_HEIGHT + ((existingBlock.endPeriod - existingBlock.startPeriod) * 1) - 4,
                          opacity: 1,
                        }
                      ]}
                      {...blockProps}
                    >
                      <Text style={styles.courseText} numberOfLines={existingBlock.endPeriod - existingBlock.startPeriod + 1 > 1 ? 2 : 1}>
                        {existingBlock.course.name}
                      </Text>
                      <Text style={styles.courseLocation} numberOfLines={existingBlock.endPeriod - existingBlock.startPeriod + 1 > 1 ? 2 : 1}>
                        {existingBlock.course.location}
                      </Text>
                    </BlockComponent>
                  )}
                  
                  {/* 미리보기 블록 (기존 수업 위에 겹쳐서 표시) */}
                  {previewBlock && (
                    <View 
                      style={[
                        styles.previewBlock, 
                        { 
                          backgroundColor: COLORS.accent.green,
                          height: (previewBlock.endPeriod - previewBlock.startPeriod + 1) * DAY_CELL_HEIGHT + ((previewBlock.endPeriod - previewBlock.startPeriod) * 1) - 4,
                          opacity: 0.7,
                        }
                      ]}
                    >
                      <Text style={styles.courseText} numberOfLines={previewBlock.endPeriod - previewBlock.startPeriod + 1 > 1 ? 2 : 1}>
                        {previewBlock.course.name}
                      </Text>
                      <Text style={styles.courseLocation} numberOfLines={previewBlock.endPeriod - previewBlock.startPeriod + 1 > 1 ? 2 : 1}>
                        {previewBlock.course.location}
                      </Text>
                    </View>
                  )}
                  
                  {/* 빈 셀 */}
                  {!existingBlock && !previewBlock && (
                    <View style={styles.emptyCell} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* 토요일 수업 표시 */}
      {saturdayCourses.length > 0 && (
        <View style={styles.gridFooter}>
          <View style={styles.footerHeader}>
            <Icon name="calendar" size={18} color={COLORS.accent.blue} />
            <Text style={styles.footerHeaderText}>토요일 수업</Text>
          </View>
          {saturdayCourses.map((course, index) => {
            const FooterItem = onFooterItemPress ? TouchableOpacity : View;
            const footerProps = onFooterItemPress ? {
              onPress: () => onFooterItemPress(course),
              activeOpacity: 0.6,
            } : {};
            
            return (
              <FooterItem 
                key={course.id} 
                style={[styles.footerCourseItem, { borderBottomWidth: index === saturdayCourses.length - 1 ? 0 : 1 }]}
                {...footerProps}
              >
                <Text style={styles.footerCourseName}>{course.name}</Text>
                <View style={styles.footerCourseInfo}>
                  <Text style={styles.footerCourseDetail}>{course.professor}</Text>
                  <Text style={styles.footerCourseDetail}>•</Text>
                  <Text style={styles.footerCourseDetail}>{course.location}</Text>
                  <Text style={styles.footerCourseDetail}>•</Text>
                  <Text style={styles.footerCourseDetail}>{formatCourseTime(course.schedule![0])}</Text>
                </View>
              </FooterItem>
            );
          })}
        </View>
      )}

      {/* 온라인 수업 표시 */}
      {noScheduleCourses.length > 0 && (
        <View style={styles.gridFooter}>
          <View style={styles.footerHeader}>
            <Icon name="book-outline" size={18} color={COLORS.accent.green} />
            <Text style={styles.footerHeaderText}>온라인 수업</Text>
          </View>
          {noScheduleCourses.map((course, index) => {
            const FooterItem = onFooterItemPress ? TouchableOpacity : View;
            const footerProps = onFooterItemPress ? {
              onPress: () => onFooterItemPress(course),
              activeOpacity: 0.6,
            } : {};
            
            return (
              <FooterItem 
                key={course.id} 
                style={[styles.footerCourseItem, { borderBottomWidth: index === noScheduleCourses.length - 1 ? 0 : 1 }]}
                {...footerProps}
              >
                <Text style={styles.footerCourseName}>{course.name}</Text>
              </FooterItem>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    width: TIME_COLUMN_WIDTH,
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
    width: TIME_COLUMN_WIDTH,
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
  previewBlock: {
    position: 'absolute',
    paddingVertical: 6,
    paddingHorizontal: 2,
    left: 0,
    right: 0,
    borderRadius: 6,
    zIndex: 100000, // 기존 수업보다 위에 표시
    margin: 2,
    outlineWidth: 1,
    outlineColor: COLORS.accent.green,
    outlineStyle: 'dashed', // 점선 테두리로 미리보기임을 표시
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

