import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, SPACING} from '@/shared/design-system/tokens';

interface ContentStatsRowProps {
  bookmarkCount: number;
  commentCount: number;
  likeCount: number;
}

export const ContentStatsRow = ({
  bookmarkCount,
  commentCount,
  likeCount,
}: ContentStatsRowProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.statItem}>
        <Icon color={COLORS.text.tertiary} name="heart-outline" size={12} />
        <Text
          style={[
            styles.statLabel,
            likeCount > 0 ? styles.likeLabelActive : null,
          ]}>
          {likeCount}
        </Text>
      </View>

      <View style={styles.statItem}>
        <Icon
          color={COLORS.text.tertiary}
          name="chatbubble-outline"
          size={12}
        />
        <Text style={styles.statLabel}>{commentCount}</Text>
      </View>

      <View style={styles.statItem}>
        <Icon
          color={
            bookmarkCount > 0 ? COLORS.status.success : COLORS.text.tertiary
          }
          name="bookmark-outline"
          size={12}
        />
        <Text
          style={[
            styles.statLabel,
            bookmarkCount > 0 ? styles.bookmarkLabelActive : null,
          ]}>
          {bookmarkCount}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bookmarkLabelActive: {
    color: COLORS.status.success,
  },
  likeLabelActive: {
    color: COLORS.status.danger,
  },
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
  },
});
