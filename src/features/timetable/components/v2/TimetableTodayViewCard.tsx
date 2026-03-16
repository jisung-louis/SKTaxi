import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '@/shared/design-system/tokens';

import {
  TIMETABLE_COURSE_TONES,
  TIMETABLE_TODAY_EMPTY_DOT_COLOR,
} from '../../model/timetableCourseTones';
import type {TimetableTodayRowViewData} from '../../model/timetableDetailViewData';

interface TimetableTodayViewCardProps {
  onPressCourse: (courseId: string) => void;
  onToggleNightClasses: () => void;
  rows: TimetableTodayRowViewData[];
  selectedCourseId?: string;
  showNightToggle: boolean;
  toggleLabel: string;
}

export const TimetableTodayViewCard = ({
  onPressCourse,
  onToggleNightClasses,
  rows,
  selectedCourseId,
  showNightToggle,
  toggleLabel,
}: TimetableTodayViewCardProps) => {
  return (
    <View style={styles.card}>
      {rows.map(row => {
        const course = row.course;
        const tone = course ? TIMETABLE_COURSE_TONES[course.toneId] : undefined;
        const selected = course?.courseId === selectedCourseId;
        const courseCardStyle = course
          ? {
              backgroundColor: tone?.softBackground,
              borderColor: selected ? tone?.accent : 'transparent',
            }
          : undefined;

        return (
          <View key={row.id} style={styles.row}>
            <View style={styles.timeColumn}>
              <Text style={styles.periodLabel}>{row.periodLabel}</Text>
              <Text style={styles.timeLabel}>{row.startTimeLabel}</Text>
              {course?.endTimeLabel ? (
                <Text style={styles.timeLabel}>{course.endTimeLabel}</Text>
              ) : null}
            </View>

            {course ? (
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.88}
                onPress={() => onPressCourse(course.courseId)}
                style={[styles.courseCard, courseCardStyle]}>
                <View
                  style={[
                    styles.courseAccent,
                    {backgroundColor: tone?.accent ?? V2_COLORS.brand.primary},
                  ]}
                />
                <Text numberOfLines={1} style={styles.courseTitle}>
                  {course.title}
                </Text>
                <Text numberOfLines={1} style={styles.courseMeta}>
                  {course.metaLabel}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyDot} />
                <Text style={styles.emptyLabel}>수업 없음</Text>
              </View>
            )}
          </View>
        );
      })}

      {showNightToggle ? (
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={onToggleNightClasses}
          style={styles.toggleButton}>
          <Text style={styles.toggleLabel}>{toggleLabel}</Text>
          <Icon color={V2_COLORS.text.secondary} name="chevron-down" size={18} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: 28,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.md,
    ...V2_SHADOWS.card,
  },
  row: {
    alignItems: 'stretch',
    flexDirection: 'row',
    marginBottom: V2_SPACING.md,
  },
  timeColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: V2_SPACING.md,
    width: 58,
  },
  periodLabel: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 2,
  },
  timeLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  courseCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    flex: 1,
    justifyContent: 'center',
    minHeight: 76,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.md,
  },
  courseAccent: {
    borderRadius: V2_RADIUS.pill,
    height: 4,
    marginBottom: V2_SPACING.sm,
    width: 28,
  },
  courseTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 4,
  },
  courseMeta: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    borderRadius: 18,
    flex: 1,
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: V2_SPACING.lg,
  },
  emptyDot: {
    backgroundColor: TIMETABLE_TODAY_EMPTY_DOT_COLOR,
    borderRadius: V2_RADIUS.pill,
    height: 8,
    marginRight: V2_SPACING.md,
    width: 8,
  },
  emptyLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  toggleButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.pill,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: V2_SPACING.xs,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.md,
  },
  toggleLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginRight: V2_SPACING.xs,
  },
});
