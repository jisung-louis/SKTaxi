import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import type {CommunityBoardPostViewData} from '../model/communityViewData';

interface CommunityBoardPostCardProps {
  item: CommunityBoardPostViewData;
  onPress: (postId: string) => void;
}

export const CommunityBoardPostCard = ({
  item,
  onPress,
}: CommunityBoardPostCardProps) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.88}
      onPress={() => onPress(item.id)}
      style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryLabel}>{item.categoryLabel}</Text>
        </View>
        <Text style={styles.timeLabel}>{item.timeLabel}</Text>
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {item.title}
      </Text>

      <Text numberOfLines={2} style={styles.excerpt}>
        {item.excerpt}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.authorLabel}>{item.authorLabel}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon color="#6B7280" name="heart-outline" size={12} />
            <Text
              style={[
                styles.statLabel,
                item.likeCount > 0 ? styles.likeLabelActive : null,
              ]}>
              {item.likeCount}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon color="#6B7280" name="chatbubble-outline" size={12} />
            <Text style={styles.statLabel}>{item.commentCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon
              color={
                item.bookmarkCount > 0 ? V2_COLORS.status.success : '#6B7280'
              }
              name="bookmark-outline"
              size={12}
            />
            <Text
              style={[
                styles.statLabel,
                item.bookmarkCount > 0 ? styles.bookmarkLabelActive : null,
              ]}>
              {item.bookmarkCount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    marginBottom: V2_SPACING.md,
    minHeight: 136,
    padding: V2_SPACING.lg,
    ...V2_SHADOWS.card,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: V2_SPACING.sm,
  },
  categoryPill: {
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.xs,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: V2_SPACING.xs,
  },
  categoryLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  timeLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: V2_SPACING.xs,
  },
  excerpt: {
    color: V2_COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: V2_SPACING.md,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  authorLabel: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: V2_SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.xs,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 16,
  },
  likeLabelActive: {
    color: '#EF4444',
  },
  bookmarkLabelActive: {
    color: V2_COLORS.status.success,
  },
});
