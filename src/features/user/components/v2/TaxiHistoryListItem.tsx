import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import type {TaxiHistoryEntryViewData} from '../../model/userActivityViewData';

interface TaxiHistoryListItemProps {
  item: TaxiHistoryEntryViewData;
}

export const TaxiHistoryListItem = ({item}: TaxiHistoryListItemProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgesRow}>
          <View
            style={[styles.badge, {backgroundColor: item.statusBackgroundColor}]}>
            <Text style={[styles.badgeLabel, {color: item.statusTextColor}]}>
              {item.statusLabel}
            </Text>
          </View>

          <View
            style={[styles.badge, {backgroundColor: item.roleBackgroundColor}]}>
            <Text style={[styles.badgeLabel, {color: item.roleTextColor}]}>
              {item.roleLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.dateLabel}>{item.dateTimeLabel}</Text>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.startDot} />
        <Text style={styles.routeLabel}>{item.departureLabel}</Text>
        <Icon
          color={V2_COLORS.text.muted}
          name="arrow-forward-outline"
          size={14}
        />
        <View style={styles.endDot} />
        <Text style={styles.routeLabel}>{item.arrivalLabel}</Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.passengerRow}>
          <Icon color={V2_COLORS.text.muted} name="people-outline" size={13} />
          <Text style={styles.passengerLabel}>{item.passengerCountLabel}</Text>
        </View>

        <View style={styles.paymentBlock}>
          <Text style={styles.paymentTitle}>내 부담금</Text>
          <Text
            style={[
              styles.paymentLabel,
              item.paymentMuted ? styles.paymentLabelMuted : undefined,
            ]}>
            {item.paymentLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    minHeight: 147,
    padding: V2_SPACING.lg,
    ...V2_SHADOWS.card,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: 2,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  dateLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  routeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    marginBottom: 12,
  },
  startDot: {
    backgroundColor: '#4ADE80',
    borderRadius: 9999,
    height: 8,
    width: 8,
  },
  endDot: {
    backgroundColor: '#F87171',
    borderRadius: 9999,
    height: 8,
    width: 8,
  },
  routeLabel: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  footerRow: {
    alignItems: 'center',
    borderTopColor: V2_COLORS.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 13,
  },
  passengerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.xs,
  },
  passengerLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  paymentBlock: {
    alignItems: 'flex-end',
  },
  paymentTitle: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  paymentLabel: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  paymentLabelMuted: {
    color: V2_COLORS.text.muted,
  },
});
