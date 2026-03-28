import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  ListCardThumbnail,
  ToneBadge,
} from '@/shared/design-system/components';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {InquiryHistoryItemViewData} from '../model/inquiryHistoryViewData';

interface InquiryHistoryListItemProps {
  item: InquiryHistoryItemViewData;
}

export const InquiryHistoryListItem = ({
  item,
}: InquiryHistoryListItemProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <ToneBadge label={item.typeLabel} tone={item.typeTone} />
          <ToneBadge label={item.statusLabel} tone={item.statusTone} />
        </View>
        <Text style={styles.dateLabel}>{item.createdAtLabel}</Text>
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.body}>
          <Text numberOfLines={2} style={styles.subject}>
            {item.subject}
          </Text>
          <Text numberOfLines={3} style={styles.preview}>
            {item.contentPreview}
          </Text>

          {item.attachmentCountLabel ? (
            <Text style={styles.attachmentLabel}>{item.attachmentCountLabel}</Text>
          ) : null}
        </View>

        {item.thumbnailUri ? (
          <ListCardThumbnail
            accessibilityLabel={`${item.subject} 첨부 이미지`}
            size={84}
            uri={item.thumbnailUri}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  badgeRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    minWidth: 0,
  },
  dateLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  bodyRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  body: {
    flex: 1,
    gap: SPACING.sm,
    minWidth: 0,
  },
  subject: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  preview: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 21,
  },
  attachmentLabel: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
