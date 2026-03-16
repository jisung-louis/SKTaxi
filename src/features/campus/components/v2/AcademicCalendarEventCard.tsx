import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import {ACADEMIC_CALENDAR_BADGE_TONE} from '../../model/academicCalendarEventTones';
import type {AcademicCalendarListItemViewData} from '../../model/academicCalendarDetailViewData';

interface AcademicCalendarEventCardProps {
  item: AcademicCalendarListItemViewData;
}

export const AcademicCalendarEventCard = ({item}: AcademicCalendarEventCardProps) => {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconWrap,
          {backgroundColor: item.iconBackgroundColor},
        ]}>
        <Icon color={item.iconColor} name={item.iconName} size={18} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {item.title}
          </Text>
          {item.importantLabel ? (
            <View style={styles.importantBadge}>
              <Text style={styles.importantBadgeLabel}>{item.importantLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.dateLabel}>{item.dateLabel}</Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          {backgroundColor: item.statusBackgroundColor},
        ]}>
        <Text style={[styles.statusLabel, {color: item.statusTextColor}]}>
          {item.statusLabel}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 73,
    paddingHorizontal: 17,
    paddingVertical: 15,
    ...V2_SHADOWS.card,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  content: {
    flex: 1,
    marginLeft: V2_SPACING.md,
    marginRight: V2_SPACING.sm,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 2,
  },
  title: {
    color: V2_COLORS.text.primary,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  importantBadge: {
    backgroundColor: ACADEMIC_CALENDAR_BADGE_TONE.backgroundColor,
    borderRadius: V2_RADIUS.pill,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  importantBadgeLabel: {
    color: ACADEMIC_CALENDAR_BADGE_TONE.textColor,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 15,
  },
  dateLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    justifyContent: 'center',
    minHeight: 24,
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
