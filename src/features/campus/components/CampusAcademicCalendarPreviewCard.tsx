import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import type {
  CampusAcademicEventBadgeViewData,
  CampusAcademicEventViewData,
} from '../../model/campusHome';
import {getHighlightToneColors} from '../../utils/campusTone';
import {CampusEmptyCard} from './CampusEmptyCard';

type CampusAcademicCalendarPreviewCardProps = {
  items: CampusAcademicEventViewData[];
  onPressItem: () => void;
};

export const CampusAcademicCalendarPreviewCard = ({
  items,
  onPressItem,
}: CampusAcademicCalendarPreviewCardProps) => {
  if (items.length === 0) {
    return (
      <CampusEmptyCard
        description="중요한 학교 일정이 생기면 여기에 정리됩니다."
        title="예정된 학사일정이 없습니다"
      />
    );
  }

  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPressItem}
            style={styles.row}>
            <View style={styles.dateBox}>
              <Text style={styles.monthText}>{item.monthLabel}</Text>
              <Text style={styles.dayText}>{item.dayLabel}</Text>
            </View>
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <View style={styles.titleInline}>
                  <Text numberOfLines={1} style={styles.title}>
                    {item.title}
                  </Text>
                  {item.badge?.placement === 'inline' ? (
                    <EventBadge badge={item.badge} />
                  ) : null}
                </View>
                {item.badge?.placement !== 'inline' && item.badge ? (
                  <EventBadge badge={item.badge} />
                ) : null}
              </View>
              <Text style={styles.dateRange}>{item.dateRangeLabel}</Text>
            </View>
          </TouchableOpacity>
          {index < items.length - 1 ? <View style={styles.separator} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
};

const EventBadge = ({badge}: {badge: CampusAcademicEventBadgeViewData}) => {
  const toneColors = getHighlightToneColors(badge.tone);

  return (
    <View
      style={[
        styles.eventBadge,
        {backgroundColor: toneColors.backgroundColor},
      ]}>
      <Text style={[styles.eventBadgeLabel, {color: toneColors.textColor}]}>
        {badge.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...V2_SHADOWS.card,
  },
  separator: {
    backgroundColor: V2_COLORS.border.subtle,
    height: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.md,
    minHeight: 80,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.lg,
  },
  dateBox: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.accent.blueSoft,
    borderRadius: V2_RADIUS.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  monthText: {
    color: V2_COLORS.accent.blue,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  dayText: {
    color: V2_COLORS.accent.blue,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  titleInline: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginRight: V2_SPACING.sm,
  },
  title: {
    color: V2_COLORS.text.primary,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  dateRange: {
    color: V2_COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
  },
  eventBadge: {
    borderRadius: V2_RADIUS.xs,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: 4,
  },
  eventBadgeLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
