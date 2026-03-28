import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, RADIUS, SPACING} from '@/shared/design-system/tokens';

import type {Notice} from '../model/types';
import {
  formatNoticeSearchDate,
  getNoticeCategoryDisplayLabel,
  getNoticeCategoryTone,
} from '../utils/noticePresentation';

const getToneStyles = (tone: ReturnType<typeof getNoticeCategoryTone>) => {
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

const buildHighlightedChunks = (text: string, query: string) => {
  const normalizedQuery = query.trim();

  if (!text || !normalizedQuery) {
    return [{text, highlighted: false}];
  }

  const normalizedText = text.toLowerCase();
  const normalizedNeedle = normalizedQuery.toLowerCase();
  const chunks: Array<{text: string; highlighted: boolean}> = [];
  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = normalizedText.indexOf(normalizedNeedle, cursor);

    if (matchIndex < 0) {
      chunks.push({text: text.slice(cursor), highlighted: false});
      break;
    }

    if (matchIndex > cursor) {
      chunks.push({
        text: text.slice(cursor, matchIndex),
        highlighted: false,
      });
    }

    chunks.push({
      text: text.slice(matchIndex, matchIndex + normalizedNeedle.length),
      highlighted: true,
    });
    cursor = matchIndex + normalizedNeedle.length;
  }

  return chunks.length > 0 ? chunks : [{text, highlighted: false}];
};

interface NoticeSearchResultListItemProps {
  isLast: boolean;
  isUnread: boolean;
  item: Notice;
  onPress: (noticeId: string) => void;
  query: string;
}

export const NoticeSearchResultListItem = ({
  isLast,
  isUnread,
  item,
  onPress,
  query,
}: NoticeSearchResultListItemProps) => {
  const categoryLabel = getNoticeCategoryDisplayLabel(item.category);
  const toneStyles = getToneStyles(getNoticeCategoryTone(categoryLabel));
  const preview = item.content?.trim() ?? '';
  const showPreview = !isUnread && preview.length > 0;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.86}
      onPress={() => onPress(item.id)}
      style={[styles.row, isLast ? styles.rowLast : null]}>
      {isUnread ? <View style={styles.dot} /> : null}
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={styles.metaRowContent}>
            <View
              style={[
                styles.categoryPill,
                {backgroundColor: toneStyles.backgroundColor},
              ]}>
              <Text
                style={[styles.categoryLabel, {color: toneStyles.textColor}]}>
                {categoryLabel}
              </Text>
            </View>
            <Text style={styles.dateLabel}>
              {formatNoticeSearchDate(item.postedAt)}
            </Text>
          </View>
          <Icon
            color={COLORS.text.muted}
            name="chevron-forward-outline"
            size={16}
          />
        </View>

        <Text
          numberOfLines={2}
          style={[styles.title, isUnread ? styles.titleUnread : null]}>
          {buildHighlightedChunks(item.title, query).map((chunk, index) => (
            <Text
              key={`${item.id}-title-${index}`}
              style={chunk.highlighted ? styles.highlightText : null}>
              {chunk.text}
            </Text>
          ))}
        </Text>

        {showPreview ? (
          <Text numberOfLines={1} style={styles.preview}>
            {buildHighlightedChunks(preview, query).map((chunk, index) => (
              <Text
                key={`${item.id}-preview-${index}`}
                style={chunk.highlighted ? styles.highlightText : null}>
                {chunk.text}
              </Text>
            ))}
          </Text>
        ) : null}
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
    gap: SPACING.md,
    minHeight: 84,
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
  content: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  metaRowContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    minWidth: 0,
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
  title: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  titleUnread: {
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  preview: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: SPACING.sm,
  },
  highlightText: {
    color: COLORS.accent.yellowStrong,
  },
});
