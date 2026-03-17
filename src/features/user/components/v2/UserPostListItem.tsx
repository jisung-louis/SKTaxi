import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';

import type {UserPostListItemViewData} from '../../model/userActivityViewData';

interface UserPostListItemProps {
  bookmarkAlignedRight?: boolean;
  isLast: boolean;
  item: UserPostListItemViewData;
  onPress: (postId: string) => void;
}

export const UserPostListItem = ({
  bookmarkAlignedRight = false,
  isLast,
  item,
  onPress,
}: UserPostListItemProps) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.86}
      onPress={() => onPress(item.postId)}
      style={[styles.row, isLast ? styles.rowLast : undefined]}>
      <View style={styles.metaRow}>
        <View
          style={[styles.categoryPill, {backgroundColor: item.categoryPillColor}]}>
          <Text style={[styles.categoryLabel, {color: item.categoryTextColor}]}>
            {item.categoryLabel}
          </Text>
        </View>
        <Text style={styles.dateLabel}>{item.dateLabel}</Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text numberOfLines={2} style={styles.excerpt}>
        {item.excerpt}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.leftStats}>
          <View style={styles.statItem}>
            <Icon color={V2_COLORS.text.muted} name="heart-outline" size={12} />
            <Text style={styles.statLabel}>{item.likeCountLabel}</Text>
          </View>

          <View style={styles.statItem}>
            <Icon
              color={V2_COLORS.text.muted}
              name="chatbubble-outline"
              size={12}
            />
            <Text style={styles.statLabel}>{item.commentCountLabel}</Text>
          </View>

          {!bookmarkAlignedRight ? (
            <View style={styles.statItem}>
              <Icon
                color={V2_COLORS.text.muted}
                name="bookmark-outline"
                size={12}
              />
              <Text style={styles.statLabel}>{item.bookmarkCountLabel}</Text>
            </View>
          ) : null}
        </View>

        {bookmarkAlignedRight ? (
          <View style={styles.statItem}>
            <Icon color={V2_COLORS.brand.primary} name="bookmark" size={12} />
            <Text style={styles.bookmarkLabel}>{item.bookmarkCountLabel}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: V2_COLORS.background.surface,
    borderBottomColor: V2_COLORS.border.subtle,
    borderBottomWidth: 1,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.lg,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    marginBottom: V2_SPACING.sm,
  },
  categoryPill: {
    borderRadius: 9999,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: 2,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  dateLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  excerpt: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 19.5,
    marginBottom: V2_SPACING.md,
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftStats: {
    flexDirection: 'row',
    gap: V2_SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.xs,
  },
  statLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  bookmarkLabel: {
    color: V2_COLORS.brand.primary,
    fontSize: 12,
    lineHeight: 16,
  },
});
