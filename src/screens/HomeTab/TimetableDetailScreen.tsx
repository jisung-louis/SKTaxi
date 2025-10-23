import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useTimetable } from '../../hooks/useTimetable';
import { useCourseSearchContext } from '../../contexts/CourseSearchContext';
import PageHeader from '../../components/common/PageHeader';
import { SemesterDropdown } from '../../components/common/SemesterDropdown';
import { TimetableEditBottomSheet } from '../../components/timetable/TimetableEditBottomSheet';
import { TimetableShareModal } from '../../components/timetable/TimetableShareModal';
import { generatePeriods, getWeekdayName, coursesToTimetableBlocks, arrangeBlocksInRows, getCurrentSemester, generateSemesterOptions } from '../../utils/timetableUtils';
import { TimetableCourse, Course, TimetableBlock } from '../../types/timetable';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { DAY_CELL_HEIGHT } from '../../constants/constants';

const DAYCELL_WIDTH = ( WINDOW_WIDTH - ( (8 * 2) + 36 ) ) / 5

export const TimetableDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const [selectedSemester, setSelectedSemester] = useState(getCurrentSemester());
  const { courses, loading, error, addCourse, removeCourse } = useTimetable(selectedSemester);
  const { loadAllCourses, isInitialized } = useCourseSearchContext();
  const [showEditBottomSheet, setShowEditBottomSheet] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const periods = generatePeriods();
  const semesterOptions = generateSemesterOptions();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = async () => {
    // 최초 1회만 수업 데이터 캐시 로드
    if (!isInitialized) {
      console.log('📚 수업 데이터를 최초 로드합니다...');
      await loadAllCourses(selectedSemester);
    } else {
      console.log('📚 수업 데이터가 이미 캐시되어 있습니다.');
    }
    setShowEditBottomSheet(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    console.log('학기 변경:', semester);
    // 학기 변경 시 시간표는 useTimetable 훅에서 자동으로 다시 로드됩니다
  };

  const handleCourseAdd = async (course: Course) => {
    try {
      await addCourse(course);
      //setShowEditBottomSheet(false);
    } catch (error) {
      console.error('Failed to add course:', error);
      //setShowEditBottomSheet(false);
    }
  };

  const handleCourseRemove = (course: Course) => {
    Alert.alert(
      '수업 삭제',
      `"${course.name}" 수업을 삭제하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCourse(course.id);
              console.log('수업이 삭제되었습니다:', course.name);
            } catch (error) {
              console.error('Failed to remove course:', error);
              Alert.alert('오류', '수업 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderTimetableGrid = () => {
    const weekdays = [1, 2, 3, 4, 5]; // 월-금
    
    // 수업을 시간표 블록으로 변환
    const timetableBlocks = coursesToTimetableBlocks(courses as TimetableCourse[]);
    const arrangedBlocks = arrangeBlocksInRows(timetableBlocks);

    return (
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
                // 해당 교시에 시작하는 블록 찾기
                const block = arrangedBlocks.find(b => 
                  b.dayOfWeek === day && b.startPeriod === period
                );
                
                return (
                  <View key={`${day}-${period}`} style={[styles.dayCell, {borderRightWidth: day === weekdays.length ? 0 : 1}]}>
                    {block ? (
                      <TouchableOpacity 
                        style={[
                          styles.courseBlock, 
                          { 
                            backgroundColor: block.course.color || COLORS.accent.blue,
                            height: (block.endPeriod - block.startPeriod + 1) * DAY_CELL_HEIGHT + ( (block.endPeriod - block.startPeriod) * 1 ) - 4, // 교시 수에 따른 높이
                          }
                        ]}
                        onPress={() => handleCourseRemove(block.course)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.courseText} numberOfLines={1}>
                          {block.course.name}
                        </Text>
                        <Text style={styles.courseLocation} numberOfLines={1}>
                          {block.course.location}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.emptyCell} />
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={handleBack} title="내 시간표" borderBottom />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.blue} />
          <Text style={styles.loadingText}>시간표를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={handleBack} title="내 시간표" borderBottom />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.text.secondary} />
          <Text style={styles.errorText}>시간표를 불러올 수 없습니다.</Text>
          <Text style={styles.errorSubtext}>잠시 후 다시 시도해주세요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader onBack={handleBack} title="내 시간표" borderBottom />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 학기 선택 및 액션 버튼 */}
        <View style={styles.headerActions}>
          <SemesterDropdown
            selectedSemester={selectedSemester}
            onSemesterChange={handleSemesterChange}
            semesterOptions={semesterOptions}
          />
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Icon name="create-outline" size={20} color={COLORS.accent.blue} />
              <Text style={styles.actionButtonText}>편집</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share-outline" size={20} color={COLORS.accent.green} />
              <Text style={styles.actionButtonText}>공유</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 시간표 그리드 */}
        <View style={styles.timetableContainer}>
          {/* {courses.length > 0 ? ( */}
          {true ? (
            renderTimetableGrid()
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={64} color={COLORS.text.secondary} />
              <Text style={styles.emptyTitle}>등록된 수업이 없습니다</Text>
              <Text style={styles.emptySubtext}>편집 버튼을 눌러 수업을 추가해보세요</Text>
              <TouchableOpacity style={styles.addCourseButton} onPress={handleEdit}>
                <Icon name="add" size={20} color={COLORS.text.buttonText} />
                <Text style={styles.addCourseButtonText}>수업 추가하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 편집 바텀시트 */}
      <TimetableEditBottomSheet
        visible={showEditBottomSheet}
        onClose={() => setShowEditBottomSheet(false)}
        onCourseAdd={handleCourseAdd}
        currentCourses={courses}
        semester={selectedSemester}
      />

      {/* 공유 모달 */}
      <TimetableShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        courses={courses}
        semester={selectedSemester}
      />
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  actionButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  timetableContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 40,
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
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  addCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.accent.blue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addCourseButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.buttonText,
    fontWeight: '600',
  },
});
