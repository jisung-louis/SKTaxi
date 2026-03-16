import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '@/shared/design-system/tokens';

import {TIMETABLE_COURSE_TONES} from '../../model/timetableCourseTones';
import type {TimetableSupplementItemViewData} from '../../model/timetableDetailViewData';

interface TimetableSupplementSectionProps {
  items: TimetableSupplementItemViewData[];
  onPressItem: (courseId: string) => void;
  selectedCourseId?: string;
  title: string;
}

export const TimetableSupplementSection = ({
  items,
  onPressItem,
  selectedCourseId,
  title,
}: TimetableSupplementSectionProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.list}>
        {items.map(item => {
          const tone = TIMETABLE_COURSE_TONES[item.toneId];
          const selected = item.courseId === selectedCourseId;

          return (
            <TouchableOpacity
              key={item.id}
              accessibilityRole="button"
              activeOpacity={0.88}
              onPress={() => onPressItem(item.courseId)}
              style={[
                styles.card,
                {borderColor: selected ? tone.accent : V2_COLORS.border.subtle},
                selected ? {backgroundColor: tone.softBackground} : null,
              ]}>
              <View style={styles.cardBody}>
                <View
                  style={[styles.toneDot, {backgroundColor: tone.accent}]}
                />
                <View style={styles.copy}>
                  <Text numberOfLines={1} style={styles.itemTitle}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.metaLabel}>
                    {item.metaLabel}
                  </Text>
                </View>
              </View>

              <Icon
                color={V2_COLORS.text.muted}
                name="chevron-forward"
                size={18}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: V2_SPACING.xxl,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: V2_SPACING.md,
  },
  list: {
    gap: V2_SPACING.sm,
  },
  card: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.md,
    ...V2_SHADOWS.card,
  },
  cardBody: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  toneDot: {
    borderRadius: V2_RADIUS.pill,
    height: 10,
    marginRight: V2_SPACING.md,
    width: 10,
  },
  copy: {
    flex: 1,
  },
  itemTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 2,
  },
  metaLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
