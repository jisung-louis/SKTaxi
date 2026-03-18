import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '@/shared/design-system/tokens';

import {
  TIMETABLE_COURSE_TONES,
  TIMETABLE_TODAY_EMPTY_DOT_COLOR,
} from '../../model/timetableCourseTones';
import type {TimetableTodayRowViewData} from '../../model/timetableDetailViewData';

const TODAY_ROW_HEIGHT = 60;
const TODAY_ROW_GAP = 8;

interface TimetableTodayViewCardProps {
  collapsed: boolean;
  onPressCourse: (courseId: string) => void;
  onToggleNightClasses: () => void;
  rows: TimetableTodayRowViewData[];
  selectedCourseId?: string;
  showNightToggle: boolean;
  toggleLabel: string;
}

export const TimetableTodayViewCard = ({
  collapsed,
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
        const rowHeight =
          TODAY_ROW_HEIGHT +
          (row.visiblePeriodSpan - 1) * (TODAY_ROW_HEIGHT + TODAY_ROW_GAP);
        const courseCardStyle = course
          ? {
              backgroundColor: tone?.softBackground,
              borderColor: selected ? tone?.accent : 'transparent',
              minHeight: rowHeight,
            }
          : undefined;

        return (
          <View key={row.id} style={styles.row}>
            <View
              style={[
                styles.timeColumn,
                {minHeight: rowHeight},
              ]}>
              {row.timeSlots.map(slot => (
                <View key={`${row.id}-${slot.periodLabel}`} style={styles.timeSlot}>
                  <Text style={styles.periodLabel}>{slot.periodLabel}</Text>
                  <Text style={styles.timeLabel}>{slot.startTimeLabel}</Text>
                </View>
              ))}
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
          <Icon
            color={V2_COLORS.text.secondary}
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            size={18}
          />
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
    marginRight: V2_SPACING.md,
    width: 58,
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.lg,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: V2_SPACING.sm,
  },
  timeSlot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  periodLabel: {
    color: V2_COLORS.text.primary,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 2,
  },
  timeLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 10,
    lineHeight: 14,
  },
  courseCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    flex: 1,
    justifyContent: 'center',
    minHeight: TODAY_ROW_HEIGHT,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: 10,
  },
  courseAccent: {
    borderRadius: V2_RADIUS.pill,
    height: 4,
    marginBottom: 6,
    width: 24,
  },
  courseTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 2,
  },
  courseMeta: {
    color: V2_COLORS.text.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    borderRadius: 16,
    flex: 1,
    flexDirection: 'row',
    minHeight: TODAY_ROW_HEIGHT,
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
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
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
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginRight: V2_SPACING.xs,
  },
});
