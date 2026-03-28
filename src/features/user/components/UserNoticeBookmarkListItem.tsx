import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {COLORS, SPACING} from '@/shared/design-system/tokens';

import type {UserNoticeBookmarkItemViewData} from '../model/userActivityViewData';

interface UserNoticeBookmarkListItemProps {
  isLast: boolean;
  item: UserNoticeBookmarkItemViewData;
  onPress: (noticeId: string) => void;
}

export const UserNoticeBookmarkListItem = ({
  isLast,
  item,
  onPress,
}: UserNoticeBookmarkListItemProps) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.86}
      onPress={() => onPress(item.noticeId)}
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
      <Text numberOfLines={3} style={styles.excerpt}>
        {item.excerpt}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: COLORS.background.surface,
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    minHeight: 104,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  categoryPill: {
    borderRadius: 9999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  dateLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  excerpt: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 19.5,
  },
});
