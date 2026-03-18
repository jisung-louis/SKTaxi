import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {CafeteriaCategorySectionViewData} from '../model/cafeteriaDetailViewData';
import {CafeteriaReactionChip} from './CafeteriaReactionChip';

interface CafeteriaCategoryCardProps {
  category: CafeteriaCategorySectionViewData;
}

export const CafeteriaCategoryCard = ({
  category,
}: CafeteriaCategoryCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{category.title}</Text>
      </View>

      <View style={styles.body}>
        {category.items.map((item, index) => (
          <View
            key={item.id}
            style={[styles.itemRow, index > 0 ? styles.itemRowBorder : undefined]}>
            <View style={styles.itemMain}>
              <View style={styles.titleRow}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.badges.map(badge => (
                  <View
                    key={badge.id}
                    style={[
                      styles.badge,
                      {backgroundColor: badge.backgroundColor},
                    ]}>
                    <Text style={[styles.badgeLabel, {color: badge.textColor}]}>
                      {badge.label}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.priceLabel}>{item.priceLabel}</Text>
            </View>

            <View style={styles.reactionRow}>
              <CafeteriaReactionChip
                countLabel={item.primaryReaction.countLabel}
                iconName={item.primaryReaction.iconName}
              />
              <CafeteriaReactionChip
                countLabel={item.negativeReaction.countLabel}
                iconName={item.negativeReaction.iconName}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  header: {
    backgroundColor: COLORS.brand.logo,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  body: {
    backgroundColor: COLORS.background.surface,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
  },
  itemRowBorder: {
    borderTopColor: COLORS.border.subtle,
    borderTopWidth: 1,
  },
  itemMain: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    columnGap: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  itemTitle: {
    color: COLORS.text.primary,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  badge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
  },
  priceLabel: {
    color: COLORS.brand.primaryStrong,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 2,
  },
  reactionRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
  },
});
