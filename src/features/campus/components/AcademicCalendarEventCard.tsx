import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import {ACADEMIC_CALENDAR_BADGE_TONE} from '../model/academicCalendarEventTones';
import type {AcademicCalendarListItemViewData} from '../model/academicCalendarDetailViewData';

interface AcademicCalendarEventCardProps {
  item: AcademicCalendarListItemViewData;
}

export const AcademicCalendarEventCard = ({item}: AcademicCalendarEventCardProps) => {
  return (
    <View style={[styles.card, item.isEnded ? styles.cardEnded : null]}>
      <View
        style={[
          styles.iconWrap,
          {backgroundColor: item.accentColor},
          item.isEnded ? styles.iconWrapEnded : null,
        ]}
      />

      <View style={[styles.content, item.isEnded ? styles.contentEnded : null]}>
        <View style={styles.titleRow}>
          <Text numberOfLines={2} style={[styles.title, item.isEnded ? styles.titleEnded : null]}>
            {item.title}
          </Text>
          {item.importantLabel ? (
            <View style={styles.importantBadge}>
              <Text style={styles.importantBadgeLabel}>{item.importantLabel}</Text>
            </View>
          ) : null}
        </View>
        {item.description ? (
          <Text numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.dateLabel}>{item.dateLabel}</Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          {backgroundColor: item.statusBackgroundColor},
          item.isEnded ? styles.statusBadgeEnded : null,
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
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 73,
    paddingHorizontal: 17,
    paddingVertical: 15,
    ...SHADOWS.card,
  },
  cardEnded: {
    backgroundColor: COLORS.background.page,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconWrapEnded: {
    opacity: 0.72,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  contentEnded: {
    opacity: 0.72,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 2,
  },
  title: {
    color: COLORS.text.primary,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  titleEnded: {
    color: COLORS.text.muted,
  },
  importantBadge: {
    backgroundColor: ACADEMIC_CALENDAR_BADGE_TONE.backgroundColor,
    borderRadius: RADIUS.pill,
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
  description: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  dateLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    minHeight: 24,
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeEnded: {
    opacity: 0.72,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
