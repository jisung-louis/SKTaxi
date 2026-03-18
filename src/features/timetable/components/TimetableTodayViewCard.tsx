import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, RADIUS, SHADOWS, SPACING} from '@/shared/design-system/tokens';

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
                    {backgroundColor: tone?.accent ?? COLORS.brand.primary},
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
            color={COLORS.text.secondary}
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
    backgroundColor: COLORS.background.surface,
    borderRadius: 28,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.card,
  },
  row: {
    alignItems: 'stretch',
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timeColumn: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 58,
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  timeSlot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  periodLabel: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 2,
  },
  timeLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    lineHeight: 14,
  },
  courseCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    flex: 1,
    justifyContent: 'center',
    minHeight: TODAY_ROW_HEIGHT,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
  },
  courseAccent: {
    borderRadius: RADIUS.pill,
    height: 4,
    marginBottom: 6,
    width: 24,
  },
  courseTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 2,
  },
  courseMeta: {
    color: COLORS.text.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: COLORS.background.page,
    borderRadius: 16,
    flex: 1,
    flexDirection: 'row',
    minHeight: TODAY_ROW_HEIGHT,
    paddingHorizontal: SPACING.lg,
  },
  emptyDot: {
    backgroundColor: TIMETABLE_TODAY_EMPTY_DOT_COLOR,
    borderRadius: RADIUS.pill,
    height: 8,
    marginRight: SPACING.md,
    width: 8,
  },
  emptyLabel: {
    color: COLORS.text.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  toggleButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.page,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  toggleLabel: {
    color: COLORS.text.secondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginRight: SPACING.xs,
  },
});
