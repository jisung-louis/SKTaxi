import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {TaxiChatSummaryViewData} from '../model/taxiChatViewData';

interface TaxiChatSummaryCardProps {
  summary: TaxiChatSummaryViewData
}

export const TaxiChatSummaryCard = ({summary}: TaxiChatSummaryCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.routeRow}>
        <View style={styles.routeSide}>
          <View style={[styles.routeIconWrap, styles.departureIconWrap]}>
            <Icon
              color={COLORS.background.surface}
              name="location"
              size={12}
            />
          </View>
          <Text numberOfLines={1} style={styles.routeLabel}>
            {summary.departureLabel}
          </Text>
        </View>

        <Icon
          color={COLORS.text.muted}
          name="arrow-forward-outline"
          size={14}
        />

        <View style={[styles.routeSide, styles.routeSideEnd]}>
          <Text numberOfLines={1} style={styles.routeLabel}>
            {summary.destinationLabel}
          </Text>
          <View style={[styles.routeIconWrap, styles.destinationIconWrap]}>
            <Icon
              color={COLORS.background.surface}
              name="business-outline"
              size={12}
            />
          </View>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaGroup}>
          <View style={styles.metaItem}>
            <Icon color={COLORS.text.secondary} name="time-outline" size={12} />
            <Text style={styles.metaLabel}>{summary.departureTimeLabel}</Text>
          </View>

          <View style={styles.metaItem}>
            <Icon color={COLORS.accent.orange} name="people-outline" size={12} />
            <Text style={styles.metaLabel}>{summary.memberSummaryLabel}</Text>
          </View>
        </View>

        <View style={styles.tagPill}>
          <Text style={styles.tagLabel}>{summary.tagLabel}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.accent.yellowBorder,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
    padding: 13,
  },
  departureIconWrap: {
    backgroundColor: COLORS.accent.yellow,
  },
  destinationIconWrap: {
    backgroundColor: COLORS.accent.orange,
  },
  metaGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  metaLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeIconWrap: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  routeLabel: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  routeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  routeSide: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  routeSideEnd: {
    justifyContent: 'flex-end',
  },
  tagLabel: {
    color: COLORS.accent.yellowStrong,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  tagPill: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.yellowSoft,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    minHeight: 18,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
});
