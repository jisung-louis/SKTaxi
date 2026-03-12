import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@/shared/constants/colors';
import { DAY_CELL_HEIGHT } from '@/shared/constants/layout';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import PageHeader from '@/shared/ui/PageHeader';
import { SemesterDropdown } from '../components/SemesterDropdown';
import { useScreenView } from '@/shared/hooks/useScreenView';

import { TimetableEditBottomSheet } from '../components/TimetableEditBottomSheet';
import { TimetableGrid } from '../components/TimetableGrid';
import { TimetableShareModal } from '../components/TimetableShareModal';
import { useTimetable } from '../hooks/useTimetable';
import { Course } from '../model/types';
import {
  generateSemesterOptions,
  getCurrentSemester,
} from '../services/timetableUtils';

export const TimetableDetailScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [selectedSemester, setSelectedSemester] = useState(getCurrentSemester());
  const { courses, loading, error, addCourse, removeCourse } = useTimetable(selectedSemester);
  const [showEditBottomSheet, setShowEditBottomSheet] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const semesterOptions = generateSemesterOptions();

  // addCourse와 courses를 ref로 래핑 → 안정적인 콜백 참조 유지
  const addCourseRef = useRef(addCourse);
  addCourseRef.current = addCourse;
  const coursesRef = useRef(courses);
  coursesRef.current = courses;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    setShowEditBottomSheet(true);
  };

  const handleEditClose = useCallback(() => {
    setShowEditBottomSheet(false);
  }, []);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    console.log('학기 변경:', semester);
    // 학기 변경 시 시간표는 useTimetable 훅에서 자동으로 다시 로드됩니다
  };

  const handleCourseAdd = useCallback(async (course: Course) => {
    try {
      await addCourseRef.current(course);
    } catch (error) {
      console.error('Failed to add course:', error);
    }
  }, []);

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
    return <TimetableGrid courses={courses} onBlockPress={handleCourseRemove} onFooterItemPress={handleCourseRemove} />;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.blue} />
          <Text style={styles.loadingText}>시간표를 불러오는 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.text.secondary} />
          <Text style={styles.errorText}>시간표를 불러올 수 없습니다.</Text>
          <Text style={styles.errorSubtext}>잠시 후 다시 시도해주세요.</Text>
        </View>
      );
    }

    return (
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
              <Icon name="add-outline" size={20} color={COLORS.accent.blue} />
              <Text style={styles.actionButtonText}>추가</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share-outline" size={20} color={COLORS.accent.green} />
              <Text style={styles.actionButtonText}>공유</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.infoText}>수업 블록을 터치하여 수업을 삭제할 수 있어요</Text>

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
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader onBack={handleBack} title="내 시간표" borderBottom />

      {renderContent()}

      {/* 편집 바텀시트 — loading/error 상태에서도 unmount되지 않음 */}
      <TimetableEditBottomSheet
        visible={showEditBottomSheet}
        onClose={handleEditClose}
        onCourseAdd={handleCourseAdd}
        currentCourses={coursesRef.current}
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
    paddingBottom: 8,
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
  infoText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.tertiary,
    paddingHorizontal: 10,
    marginBottom: 8,
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
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.dark,
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
