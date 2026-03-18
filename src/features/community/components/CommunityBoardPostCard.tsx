import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
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
                item.bookmarkCount > 0 ? COLORS.status.success : '#6B7280'
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
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    minHeight: 136,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryPill: {
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
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
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  excerpt: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.md,
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
    gap: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
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
    color: COLORS.status.success,
  },
});
