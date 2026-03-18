import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {NoticeHomeNoticeItemViewData} from '../../model/noticeHomeViewData';
import {V2_COLORS, V2_RADIUS, V2_SPACING} from '@/shared/design-system/tokens';

const getToneStyles = (tone: NoticeHomeNoticeItemViewData['categoryTone']) => {
  switch (tone) {
    case 'blue':
      return {
        backgroundColor: V2_COLORS.accent.blueSoft,
        textColor: V2_COLORS.accent.blue,
      };
    case 'purple':
      return {
        backgroundColor: V2_COLORS.accent.purpleSoft,
        textColor: V2_COLORS.accent.purple,
      };
    case 'orange':
      return {
        backgroundColor: V2_COLORS.accent.orangeSoft,
        textColor: V2_COLORS.accent.orange,
      };
    case 'pink':
      return {
        backgroundColor: V2_COLORS.accent.pinkSoft,
        textColor: V2_COLORS.accent.pink,
      };
    case 'gray':
    default:
      return {
        backgroundColor: V2_COLORS.background.subtle,
        textColor: V2_COLORS.text.secondary,
      };
  }
};

interface NoticeListItemV2Props {
  isLast: boolean;
  item: NoticeHomeNoticeItemViewData;
  onPress: (noticeId: string) => void;
}

export const NoticeListItemV2 = ({
  isLast,
  item,
  onPress,
}: NoticeListItemV2Props) => {
  const toneStyles = getToneStyles(item.categoryTone);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.86}
      onPress={() => onPress(item.id)}
      style={[styles.row, isLast ? styles.rowLast : null]}>
        {item.isUnread ? (
          <View style={styles.dot} />
        ) : null}
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.categoryPill,
              {backgroundColor: toneStyles.backgroundColor},
            ]}>
            <Text style={[styles.categoryLabel, {color: toneStyles.textColor}]}>
              {item.categoryLabel}
            </Text>
          </View>
          <Text style={styles.dateLabel}>{item.dateLabel}</Text>
        </View>
        <Text
          numberOfLines={2}
          style={[styles.title, item.isUnread ? styles.titleUnread : null]}>
          {item.title}
        </Text>
      </View>
      <Icon
        color={V2_COLORS.text.muted}
        name="chevron-forward-outline"
        size={16}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    borderBottomColor: V2_COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 85,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.lg,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  dot: {
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.pill,
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
    gap: V2_SPACING.sm,
    marginBottom: V2_SPACING.sm,
  },
  categoryPill: {
    borderRadius: V2_RADIUS.xs,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: 2,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  dateLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    color: V2_COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  titleUnread: {
    color: V2_COLORS.text.primary,
    fontWeight: '700',
  },
});
