import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SPACING} from '@/shared/design-system/tokens';

import {TIMETABLE_COURSE_TONES} from '../../model/timetableCourseTones';
import type {TimetableCourseDetailViewData} from '../../model/timetableDetailViewData';
import {TimetableBottomSheet} from './TimetableBottomSheet';

interface TimetableCourseDetailSheetProps {
  course?: TimetableCourseDetailViewData;
  onClose: () => void;
  onDelete: () => void;
}

export const TimetableCourseDetailSheet = ({
  course,
  onClose,
  onDelete,
}: TimetableCourseDetailSheetProps) => {
  if (!course) {
    return null;
  }

  const tone = TIMETABLE_COURSE_TONES[course.toneId];

  return (
    <TimetableBottomSheet onClose={onClose} visible={Boolean(course)}>
      <View style={styles.hero}>
        <View style={[styles.codeChip, {backgroundColor: tone.pillBackground}]}>
          <View style={[styles.codeDot, {backgroundColor: tone.accent}]} />
          <Text style={[styles.codeLabel, {color: tone.text}]}>
            {course.codeLabel}
          </Text>
        </View>
        <Text style={styles.title}>{course.title}</Text>
      </View>

      <View style={styles.rows}>
        {course.rows.map(row => (
          <View key={row.id} style={styles.row}>
            <View style={styles.iconBox}>
              <Icon
                color={V2_COLORS.text.secondary}
                name={row.iconName}
                size={18}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.88}
        onPress={onDelete}
        style={styles.deleteButton}>
        <Text style={styles.deleteLabel}>{course.deleteLabel}</Text>
      </TouchableOpacity>
    </TimetableBottomSheet>
  );
};

const styles = StyleSheet.create({
  hero: {
    marginBottom: V2_SPACING.lg,
  },
  codeChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: V2_RADIUS.pill,
    flexDirection: 'row',
    marginBottom: V2_SPACING.md,
    paddingHorizontal: V2_SPACING.md,
    paddingVertical: V2_SPACING.sm,
  },
  codeDot: {
    borderRadius: V2_RADIUS.pill,
    height: 8,
    marginRight: V2_SPACING.sm,
    width: 8,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
  },
  rows: {
    gap: V2_SPACING.sm,
  },
  row: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.md,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.md,
    height: 36,
    justifyContent: 'center',
    marginRight: V2_SPACING.md,
    width: 36,
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
  rowValue: {
    color: V2_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderRadius: V2_RADIUS.pill,
    marginTop: V2_SPACING.xl,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.md,
  },
  deleteLabel: {
    color: V2_COLORS.status.danger,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
});
