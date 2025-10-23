import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { CourseSearch } from './CourseSearch';
import { TimetablePreview } from './TimetablePreview';
import { Course } from '../../types/timetable';
import { findOverlappingCourses } from '../../utils/timetableUtils';

interface TimetableEditBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onCourseAdd: (course: Course) => void;
  currentCourses: Course[];
  semester: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const TimetableEditBottomSheet: React.FC<TimetableEditBottomSheetProps> = ({
  visible,
  onClose,
  onCourseAdd,
  currentCourses,
  semester,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCourseSelect = (course: Course) => {
    // 이미 선택된 수업을 다시 누르면 선택 해제
    if (selectedCourse?.id === course.id) {
      setSelectedCourse(null);
    } else {
      setSelectedCourse(course);
    }
  };

  const handleCourseAdd = async (course: Course) => {
    try {
      // 겹치는 수업들 확인
      const overlappingCourses = findOverlappingCourses(course, currentCourses);
      
      if (overlappingCourses.length > 0) {
        // 겹치는 수업이 있는 경우 사용자에게 확인
        const overlappingNames = overlappingCourses.map(c => c.name).join(', ');
        Alert.alert(
          '시간 충돌',
          `다음 수업들과 시간이 겹칩니다:\n${overlappingNames}\n\n이 수업들을 삭제하고 새 수업을 추가하시겠습니까?`,
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '확인',
              onPress: async () => {
                await onCourseAdd(course);
                setSelectedCourse(null);
              },
            },
          ]
        );
      } else {
        // 겹치는 수업이 없는 경우 바로 추가
        await onCourseAdd(course);
        setSelectedCourse(null);
      }
    } catch (error) {
      console.error('Failed to add course:', error);
    }
  };

  const handleClose = () => {
    setSelectedCourse(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>수업 추가</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* 통합 컨텐츠 */}
        <View style={styles.content}>
          {/* 시간표 미리보기 */}
          <View style={styles.previewSection}>
            <TimetablePreview
              courses={currentCourses}
              selectedCourse={selectedCourse}
            />
          </View>

          {/* 수업 검색 */}
          <View style={styles.searchSection}>
            <CourseSearch
              onCourseSelect={handleCourseSelect}
              onCourseAdd={handleCourseAdd}
              selectedCourseId={selectedCourse?.id}
              semester={semester}
              currentCourses={currentCourses}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  previewSection: {
    flex: 0.4, // 상단 40%
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    paddingHorizontal: 8,
  },
  searchSection: {
    flex: 0.6, // 하단 60%
  },
});



