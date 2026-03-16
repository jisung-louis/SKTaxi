import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS} from '@/shared/design-system/tokens';

import {TIMETABLE_COURSE_TONES} from '../../model/timetableCourseTones';
import type {TimetableSupplementItemViewData} from '../../model/timetableDetailViewData';

interface TimetableSupplementSectionProps {
  items: TimetableSupplementItemViewData[];
  kind: 'online' | 'saturday';
  onPressItem: (courseId: string) => void;
  selectedCourseId?: string;
  title: string;
}

export const TimetableSupplementSection = ({
  items,
  kind,
  onPressItem,
  selectedCourseId,
  title,
}: TimetableSupplementSectionProps) => {
  if (items.length === 0) {
    return null;
  }

  const iconName = kind === 'online' ? 'desktop-outline' : 'calendar-outline';
  const iconColor = kind === 'online' ? '#60A5FA' : '#FB923C';

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon color={iconColor} name={iconName} size={14} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

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
                selected ? {backgroundColor: tone.softBackground} : null,
              ]}>
              <View style={[styles.accentBar, {backgroundColor: tone.accent}]} />

              <View style={styles.copy}>
                <View style={styles.titleRow}>
                  <Text numberOfLines={1} style={styles.itemTitle}>
                    {item.title}
                  </Text>
                  {kind === 'online' ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeLabel}>온라인</Text>
                    </View>
                  ) : null}
                </View>
                <Text numberOfLines={1} style={styles.metaLabel}>
                  {item.metaLabel}
                </Text>
              </View>

              <Icon color={V2_COLORS.border.default} name="chevron-forward" size={18} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginLeft: 8,
  },
  list: {
    gap: 8,
  },
  card: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    height: 62,
    paddingHorizontal: 16,
    ...V2_SHADOWS.card,
  },
  accentBar: {
    borderRadius: V2_RADIUS.pill,
    height: 38,
    marginRight: 12,
    width: 4,
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 2,
  },
  itemTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    borderRadius: V2_RADIUS.pill,
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeLabel: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
  },
  metaLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
