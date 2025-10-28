import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { Course } from '../../types/timetable';
import { getWeekdayName, formatCourseTime } from '../../utils/timetableUtils';

interface CourseCardProps {
  course: Course;
  isSelected?: boolean;
  isPreview?: boolean;
  isAlreadyAdded?: boolean; // 이미 시간표에 추가된 수업인지
  onPress?: (course: Course) => void;
  onAddToTimetable?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isSelected = false,
  isPreview = false,
  isAlreadyAdded = false,
  onPress,
  onAddToTimetable,
}) => {
  const handlePress = () => {
    onPress?.(course);
  };

  const handleAddToTimetable = () => {
    if (!isAlreadyAdded) {
      onAddToTimetable?.(course);
    }
  };

  // 수업 시간 정보 포맷팅
  const formatSchedule = () => {
    if (!course.schedule || course.schedule.length === 0) {
      return '시간 정보 없음';
    }

    const scheduleTexts = course.schedule.map(schedule => {
      return formatCourseTime(schedule);
    });

    return scheduleTexts.join(', ');
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isPreview && styles.previewContainer,
        isAlreadyAdded && styles.alreadyAddedContainer,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* 선택 상태 표시 */}
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.blue} />
        </View>
      )}

      {/* 이미 추가된 수업 표시 */}
      {isAlreadyAdded && (
        <View style={styles.alreadyAddedIndicator}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.green} />
        </View>
      )}

      {/* 수업 정보 */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.courseName} numberOfLines={1}>
            {course.name}
          </Text>
          <Text style={styles.courseCode}>{course.code} ({course.division})</Text>
        </View>
        {(isSelected && onAddToTimetable) ? (
        <View style={styles.details}>
          {course.professor !== '' && (
            <View style={styles.detailRow}>
              <Icon name="person" size={14} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>{course.professor} 교수</Text>
            </View>
          )}
          {course.location !== '' && (
            <View style={styles.detailRow}>
              <Icon name="location" size={14} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>{course.location}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Icon name="time" size={14} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>{formatSchedule()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="school" size={14} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>{course.department}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="man" size={14} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>{course.grade}학년</Text>
          </View>
        </View>
        ) : (
          <View style={styles.details}>
            <View style={styles.detailSimpleTextRow}>
              {course.professor !== '' && (
                <>
                  <Text style={styles.detailSimplifiedText}>{course.professor}</Text>
                  <Text style={styles.detailSimplifiedText}> • </Text>
                </>
              )}
              {course.location !== '' && (
                <>
                  <Text style={styles.detailSimplifiedText}>{course.location}</Text>
                  <Text style={styles.detailSimplifiedText}> • </Text>
                </>
              )}
              <Text style={styles.detailSimplifiedText}>{formatSchedule()}</Text>
            </View>
            <View style={styles.detailSimpleTextRow}>
              <Text style={[styles.detailSimplifiedText, { ...TYPOGRAPHY.caption2 }]}>{course.department} {course.grade}학년 {course.category}</Text>
            </View>
          </View>
        )}

        {/* 학점 및 이수구분 정보 */}
        {(isSelected && onAddToTimetable) && (
        <View style={styles.footer}>
          <View style={[styles.creditsContainer, { backgroundColor: isAlreadyAdded ? COLORS.background.primary : COLORS.background.card }]}>
            <Text style={styles.creditsText}>{course.credits}학점</Text>
          </View>
          <View style={[styles.categoryContainer, { backgroundColor: isAlreadyAdded ? COLORS.background.primary : COLORS.background.card }]}>
            <Text style={styles.categoryText}>{course.category}</Text>
          </View>
        </View>
        )}
      </View>

      {/* 시간표에 추가 버튼 */}
      {isSelected && onAddToTimetable && (
        <TouchableOpacity
          style={[
            styles.addButton,
            isAlreadyAdded && styles.addButtonDisabled
          ]}
          onPress={handleAddToTimetable}
          activeOpacity={isAlreadyAdded ? 1 : 0.8}
          disabled={isAlreadyAdded}
        >
          <Icon 
            name={isAlreadyAdded ? "checkmark" : "add"} 
            size={16} 
            color={COLORS.text.buttonText} 
          />
          <Text style={styles.addButtonText}>
            {isAlreadyAdded ? '이미 추가된 수업이에요' : '시간표에 추가'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    outlineWidth: 1,
    outlineColor: COLORS.border.default,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedContainer: {
    outlineColor: COLORS.accent.blue,
    outlineWidth: 2,
    backgroundColor: COLORS.background.primary,
  },
  previewContainer: {
    outlineColor: COLORS.accent.green,
    outlineWidth: 2,
    backgroundColor: COLORS.background.primary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  alreadyAddedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  alreadyAddedContainer: {
    backgroundColor: COLORS.background.secondary,
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 12,
  },
  courseName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  courseCode: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailSimpleTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    flex: 1,
  },
  detailSimplifiedText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  creditsContainer: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  creditsText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  categoryContainer: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  categoryText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.accent.blue,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  addButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.buttonText,
    fontWeight: '600',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
});



