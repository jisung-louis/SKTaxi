import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {NoticeHomeNoticeItemViewData} from '../model/noticeHomeViewData';
import {ContentStatsRow} from '@/shared/design-system/components';
import {COLORS, RADIUS, SPACING} from '@/shared/design-system/tokens';

const getToneStyles = (tone: NoticeHomeNoticeItemViewData['categoryTone']) => {
  switch (tone) {
    case 'blue':
      return {
        backgroundColor: COLORS.accent.blueSoft,
        textColor: COLORS.accent.blue,
      };
    case 'purple':
      return {
        backgroundColor: COLORS.accent.purpleSoft,
        textColor: COLORS.accent.purple,
      };
    case 'orange':
      return {
        backgroundColor: COLORS.accent.orangeSoft,
        textColor: COLORS.accent.orange,
      };
    case 'pink':
      return {
        backgroundColor: COLORS.accent.pinkSoft,
        textColor: COLORS.accent.pink,
      };
    case 'gray':
    default:
      return {
        backgroundColor: COLORS.background.subtle,
        textColor: COLORS.text.secondary,
      };
  }
};

const IconSize = 16;

interface NoticeListItemProps {
  isLast: boolean;
  item: NoticeHomeNoticeItemViewData;
  onPress: (noticeId: string) => void;
}

export const NoticeListItem = ({
  isLast,
  item,
  onPress,
}: NoticeListItemProps) => {
  const toneStyles = getToneStyles(item.categoryTone);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.86}
      onPress={() => onPress(item.id)}
      style={[styles.row, isLast ? styles.rowLast : null]}>
      {item.isUnread ? <View style={styles.dot} /> : null}
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={styles.metaRowContent}>
            <View
              style={[
                styles.categoryPill,
                {backgroundColor: toneStyles.backgroundColor},
              ]}>
              <Text style={[styles.categoryLabel, {color: toneStyles.textColor}]}>
                {item.categoryLabel}
              </Text>
            </View>
            <Text style={styles.dateLabel}>{item.timeLabel}</Text>
          </View>
          <Icon
            color={COLORS.text.muted}
            name="chevron-forward-outline"
            size={IconSize}
          />
        </View>
        <Text
          numberOfLines={2}
          style={[styles.title, item.isUnread ? styles.titleUnread : null]}>
          {item.title}
        </Text>
        <View style={styles.footerRow}>
          <Text numberOfLines={1} style={styles.authorLabel}>
            {item.authorLabel}
          </Text>
          <ContentStatsRow
            bookmarkCount={item.bookmarkCount}
            commentCount={item.commentCount}
            isBookmarked={item.isBookmarked}
            isCommentedByMe={item.isCommentedByMe}
            isLiked={item.isLiked}
            likeCount={item.likeCount}
            viewCount={item.viewCount}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 85,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  dot: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.pill,
    height: 8,
    marginTop: 8,
    width: 8,
  },
  dotHidden: {
    opacity: 0,
  },
  content: {
    flex: 1,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    justifyContent: 'space-between',
  },
  metaRowContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  categoryPill: {
    borderRadius: RADIUS.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  dateLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  authorLabel: {
    color: COLORS.text.tertiary,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    marginRight: SPACING.sm,
  },
  title: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginRight: IconSize + SPACING.sm,
  },
  titleUnread: {
    color: COLORS.text.primary,
    fontWeight: '700',
  },
});
