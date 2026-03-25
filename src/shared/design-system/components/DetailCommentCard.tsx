import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {ContentDetailCommentViewData} from '@/shared/types/contentDetailViewData';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '../tokens';

interface DetailCommentCardProps {
  comment: ContentDetailCommentViewData;
  actionLabel?: string;
  onPressAction?: () => void;
}

export const DetailCommentCard = ({
  actionLabel,
  comment,
  onPressAction,
}: DetailCommentCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.authorRow}>
          <View style={styles.avatarCircle}>
            <Icon color={COLORS.text.muted} name="person-outline" size={12} />
          </View>
          <Text style={styles.authorLabel}>{comment.authorLabel}</Text>
        </View>
        <View style={styles.trailingRow}>
          {actionLabel && onPressAction ? (
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={onPressAction}>
              <Text style={styles.actionLabel}>{actionLabel}</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.dateLabel}>{comment.dateLabel}</Text>
        </View>
      </View>

      <Text style={styles.bodyText}>{comment.body}</Text>

      <View style={styles.footerRow}>
        <View style={styles.likeRow}>
          <Icon
            color={COLORS.text.muted}
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
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  authorLabel: {
    color: COLORS.text.strong,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  actionLabel: {
    color: COLORS.brand.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  dateLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  bodyText: {
    color: COLORS.text.strong,
    fontSize: 14,
    lineHeight: 23,
    marginBottom: SPACING.sm,
  },
  footerRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  likeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  likeCount: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  trailingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
