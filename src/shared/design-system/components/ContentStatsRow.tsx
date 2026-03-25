import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, SPACING} from '@/shared/design-system/tokens';

interface ContentStatsRowProps {
  bookmarkCount: number;
  commentCount: number;
  isBookmarked?: boolean;
  isCommentedByMe?: boolean;
  isLiked?: boolean;
  likeCount: number;
}

export const ContentStatsRow = ({
  bookmarkCount,
  commentCount,
  isBookmarked = false,
  isCommentedByMe = false,
  isLiked = false,
  likeCount,
}: ContentStatsRowProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.statItem}>
        <Icon
          color={isLiked ? COLORS.status.danger : COLORS.text.tertiary}
          name={isLiked ? 'heart' : 'heart-outline'}
          size={12}
        />
        <Text style={styles.statLabel}>{likeCount}</Text>
      </View>

      <View style={styles.statItem}>
        <Icon
          color={isCommentedByMe ? COLORS.status.info : COLORS.text.tertiary}
          name={isCommentedByMe ? 'chatbubble' : 'chatbubble-outline'}
          size={12}
        />
        <Text style={styles.statLabel}>{commentCount}</Text>
      </View>

      <View style={styles.statItem}>
        <Icon
          color={isBookmarked ? COLORS.status.success : COLORS.text.tertiary}
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={12}
        />
        <Text style={styles.statLabel}>{bookmarkCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  statLabel: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
