import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {ContentDetailCommentViewData} from '@/shared/types/contentDetailViewData';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '../tokens';

interface V2DetailCommentCardProps {
  comment: ContentDetailCommentViewData;
}

export const V2DetailCommentCard = ({
  comment,
}: V2DetailCommentCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.authorRow}>
          <View style={styles.avatarCircle}>
            <Icon color={V2_COLORS.text.muted} name="person-outline" size={12} />
          </View>
          <Text style={styles.authorLabel}>{comment.authorLabel}</Text>
        </View>
        <Text style={styles.dateLabel}>{comment.dateLabel}</Text>
      </View>

      <Text style={styles.bodyText}>{comment.body}</Text>

      <View style={styles.footerRow}>
        <View style={styles.likeRow}>
          <Icon
            color={V2_COLORS.text.muted}
            name="thumbs-up-outline"
            size={12}
          />
          <Text style={styles.likeCount}>{comment.likeCount}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    marginBottom: V2_SPACING.md,
    padding: V2_SPACING.lg,
    ...V2_SHADOWS.card,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: V2_SPACING.sm,
  },
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  authorLabel: {
    color: V2_COLORS.text.strong,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  dateLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  bodyText: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    lineHeight: 23,
    marginBottom: V2_SPACING.sm,
  },
  footerRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  likeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.xs,
  },
  likeCount: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
