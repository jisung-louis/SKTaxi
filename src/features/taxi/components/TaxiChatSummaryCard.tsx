import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import type {TaxiChatSummaryViewData} from '../../model/taxiChatViewData';

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
              color={V2_COLORS.background.surface}
              name="location"
              size={12}
            />
          </View>
          <Text numberOfLines={1} style={styles.routeLabel}>
            {summary.departureLabel}
          </Text>
        </View>

        <Icon
          color={V2_COLORS.text.muted}
          name="arrow-forward-outline"
          size={14}
        />

        <View style={[styles.routeSide, styles.routeSideEnd]}>
          <Text numberOfLines={1} style={styles.routeLabel}>
            {summary.destinationLabel}
          </Text>
          <View style={[styles.routeIconWrap, styles.destinationIconWrap]}>
            <Icon
              color={V2_COLORS.background.surface}
              name="business-outline"
              size={12}
            />
          </View>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaGroup}>
          <View style={styles.metaItem}>
            <Icon color={V2_COLORS.text.secondary} name="time-outline" size={12} />
            <Text style={styles.metaLabel}>{summary.departureTimeLabel}</Text>
          </View>

          <View style={styles.metaItem}>
            <Icon color={V2_COLORS.accent.orange} name="people-outline" size={12} />
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
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.accent.yellowBorder,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    marginBottom: V2_SPACING.lg,
    marginTop: V2_SPACING.xs,
    padding: 13,
  },
  departureIconWrap: {
    backgroundColor: V2_COLORS.accent.yellow,
  },
  destinationIconWrap: {
    backgroundColor: V2_COLORS.accent.orange,
  },
  metaGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: V2_SPACING.md,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.xs,
  },
  metaLabel: {
    color: V2_COLORS.text.secondary,
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
    borderRadius: V2_RADIUS.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  routeLabel: {
    color: V2_COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  routeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    marginBottom: V2_SPACING.sm,
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
    color: V2_COLORS.accent.yellowStrong,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  tagPill: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.accent.yellowSoft,
    borderRadius: V2_RADIUS.pill,
    justifyContent: 'center',
    minHeight: 18,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: 2,
  },
});
