import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {CampusNoticeItemViewData} from '../model/campusHome';
import {getNoticeToneColors} from '../utils/campusTone';
import {CampusEmptyCard} from './CampusEmptyCard';

type CampusNoticePreviewCardProps = {
  items: CampusNoticeItemViewData[];
  onPressItem: () => void;
};

export const CampusNoticePreviewCard = ({
  items,
  onPressItem,
}: CampusNoticePreviewCardProps) => {
  if (items.length === 0) {
    return (
      <CampusEmptyCard
        description="확인하지 않은 공지가 생기면 여기에 표시됩니다."
        title="새로운 공지가 없습니다"
      />
    );
  }

  return (
    <View style={styles.card}>
      {items.map((item, index) => {
        const toneColors = getNoticeToneColors(item.tone);

        return (
          <React.Fragment key={item.id}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={onPressItem}
              style={styles.row}>
              <View style={styles.dot} />
              <View style={styles.content}>
                <View style={styles.metaRow}>
                  <View
                    style={[
                      styles.categoryPill,
                      {backgroundColor: toneColors.backgroundColor},
                    ]}>
                    <Text
                      style={[
                        styles.categoryLabel,
                        {color: toneColors.textColor},
                      ]}>
                      {item.categoryLabel}
                    </Text>
                  </View>
                  <Text style={styles.date}>{item.publishedAtLabel}</Text>
                </View>
                <Text numberOfLines={1} style={styles.title}>
                  {item.title}
                </Text>
              </View>
              <Icon
                color={COLORS.text.muted}
                name="chevron-forward-outline"
                size={16}
              />
            </TouchableOpacity>
            {index < items.length - 1 ? <View style={styles.separator} /> : null}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  separator: {
    backgroundColor: COLORS.border.subtle,
    height: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    minHeight: 76,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  dot: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.pill,
    height: 8,
    width: 8,
  },
  content: {
    flex: 1,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
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
  date: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
