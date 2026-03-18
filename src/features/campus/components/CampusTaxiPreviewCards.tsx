import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {CampusTaxiPartyViewData} from '../../model/campusHome';
import {CampusEmptyCard} from './CampusEmptyCard';

type CampusTaxiPreviewCardsProps = {
  items: CampusTaxiPartyViewData[];
  onPressItem: () => void;
};

export const CampusTaxiPreviewCards = ({
  items,
  onPressItem,
}: CampusTaxiPreviewCardsProps) => {
  if (items.length === 0) {
    return (
      <CampusEmptyCard
        description="새로운 합승 모집이 생기면 이 섹션에서 바로 확인할 수 있습니다."
        title="현재 모집 중인 택시가 없습니다"
      />
    );
  }

  return (
    <View style={styles.list}>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.82}
          onPress={onPressItem}
          style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.iconBadge}>
              <Icon
                color={COLORS.brand.primary}
                name="bag-handle-outline"
                size={14}
              />
            </View>
            <Text numberOfLines={1} style={styles.routeText}>
              <Text style={styles.routeTextStrong}>{item.routeLabel}</Text>
              <Text style={styles.routeTextMuted}>
                {` · ${item.departureTimeLabel} · ${item.seatStatusLabel}`}
              </Text>
            </Text>
          </View>
          <Icon
            color={COLORS.text.muted}
            name="chevron-forward-outline"
            size={16}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: SPACING.md,
  },
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: 17,
    paddingVertical: 15,
    ...SHADOWS.card,
  },
  infoRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    marginRight: SPACING.sm,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primaryTint,
    borderRadius: RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  routeText: {
    color: COLORS.text.muted,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  routeTextStrong: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  routeTextMuted: {
    color: COLORS.text.muted,
  },
});
