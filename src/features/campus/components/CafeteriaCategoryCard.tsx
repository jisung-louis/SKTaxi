import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {COLORS, RADIUS, SHADOWS, SPACING} from '@/shared/design-system/tokens';

import type {CafeteriaCategorySectionViewData} from '../model/cafeteriaDetailViewData';
import {getCafeteriaCategoryColors} from '../utils/cafeteriaCategoryColors';
import {CafeteriaReactionChip} from './CafeteriaReactionChip';

interface CafeteriaCategoryCardProps {
  category: CafeteriaCategorySectionViewData;
}

export const CafeteriaCategoryCard = ({
  category,
}: CafeteriaCategoryCardProps) => {
  const categoryColors = getCafeteriaCategoryColors(category.id);

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={categoryColors.headerGradientColors}
        end={{x: 1, y: 1}}
        start={{x: 0, y: 0}}
        style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            {color: categoryColors.headerTextColor},
          ]}>
          {category.title}
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        {category.items.map((item, index) => (
          <View key={item.id}>
            <View
              style={[
                styles.itemRow,
                index > 0 ? styles.itemRowBorder : undefined,
              ]}>
              <View style={styles.itemMain}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.badges.map(badge => (
                    <View key={badge.id} style={styles.badge}>
                      <Text style={styles.badgeLabel}>{badge.label}</Text>
                    </View>
                  ))}
                </View>
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
    borderBottomColor: COLORS.background.pageHeader,
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  body: {
    backgroundColor: COLORS.background.surface,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 11,
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
    backgroundColor: COLORS.brand.primaryTint,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeLabel: {
    color: COLORS.brand.primaryStrong,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
  },
  reactionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
});
