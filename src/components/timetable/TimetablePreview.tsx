import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { Course, TimetableBlock } from '../../types/timetable';
import { generatePeriods, getWeekdayName, coursesToTimetableBlocks, arrangeBlocksInRows } from '../../utils/timetableUtils';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { DAY_CELL_HEIGHT } from '../../constants/constants';

const DAYCELL_WIDTH = ( WINDOW_WIDTH - ( (8 * 2) + 36 ) ) / 5

interface TimetablePreviewProps {
  courses: Course[];
  selectedCourse?: Course | null;
  onCoursePress?: (course: Course) => void;
}

export const TimetablePreview: React.FC<TimetablePreviewProps> = ({
  courses,
  selectedCourse,
  onCoursePress,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const periods = generatePeriods();
  const weekdays = [1, 2, 3, 4, 5]; // 월-금

  // 수업을 시간표 블록으로 변환
  const timetableBlocks = coursesToTimetableBlocks(courses);
  const arrangedBlocks = arrangeBlocksInRows(timetableBlocks);

  // 미리보기용 블록 (별도 처리)
  const previewBlocks = selectedCourse ? coursesToTimetableBlocks([{ ...selectedCourse, isPreview: true }]) : [];
  const arrangedPreviewBlocks = arrangeBlocksInRows(previewBlocks);

  // 선택된 수업이 변경될 때 해당 위치로 스크롤
  useEffect(() => {
    if (selectedCourse && scrollViewRef.current) {
      // 선택된 수업의 시간대 계산
      const courseSchedules = selectedCourse.schedule || [];
      if (courseSchedules.length > 0) {
        const firstSchedule = courseSchedules[0];
        const startPeriod = firstSchedule.startPeriod;
        
        // 스크롤 위치 계산 (교시 * 셀 높이)
        const scrollY = (startPeriod - 1) * DAY_CELL_HEIGHT;
        
        // 부드럽게 스크롤
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, scrollY), // 약간의 여백 추가
            animated: true
          });
        }, 50); // 렌더링 완료 후 스크롤
      }
    }
  }, [selectedCourse]);

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 10 }}
      showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {/* 헤더 */}
          <View style={styles.gridHeader}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeHeaderText}>교시</Text>
            </View>
            {weekdays.map(day => (
              <View key={day} style={[styles.dayColumn, {borderRightWidth: day === weekdays.length ? 0 : 1}]}>
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
                  
                  return (
                    <View key={`${day}-${period}`} style={[styles.dayCell, {borderRightWidth: day === weekdays.length ? 0 : 1}]}>
                      {/* 기존 수업 블록 */}
                      {existingBlock && (
                        <View 
                          style={[
                            styles.courseBlock, 
                            { 
                              backgroundColor: existingBlock.course.color || COLORS.accent.blue,
                              height: (existingBlock.endPeriod - existingBlock.startPeriod + 1) * DAY_CELL_HEIGHT + ( (existingBlock.endPeriod - existingBlock.startPeriod) * 1 ) - 4,
                              opacity: 1,
                            }
                          ]}
                        >
                          <Text style={styles.courseText} numberOfLines={1}>
                            {existingBlock.course.name}
                          </Text>
                          <Text style={styles.courseLocation} numberOfLines={1}>
                            {existingBlock.course.location}
                          </Text>
                        </View>
                      )}
                      
                      {/* 미리보기 블록 (기존 수업 위에 겹쳐서 표시) */}
                      {previewBlock && (
                        <View 
                          style={[
                            styles.previewBlock, 
                            { 
                              backgroundColor: COLORS.accent.green,
                              height: (previewBlock.endPeriod - previewBlock.startPeriod + 1) * DAY_CELL_HEIGHT + ( (previewBlock.endPeriod - previewBlock.startPeriod) * 1 ) - 4,
                              opacity: 0.7,
                            }
                          ]}
                        >
                          <Text style={styles.courseText} numberOfLines={1}>
                            {previewBlock.course.name}
                          </Text>
                          <Text style={styles.courseLocation} numberOfLines={1}>
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
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.dark,
    overflow: 'hidden',
  },
  gridHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.dark,
  },
  timeColumn: {
    width: 35,
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
    width: 35,
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
});