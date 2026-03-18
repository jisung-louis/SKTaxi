import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {InquiryTypeOptionViewData} from '../../model/inquiryFormViewData';

interface InquiryTypeChipsProps {
  items: InquiryTypeOptionViewData[];
  onPressItem: (id: InquiryTypeOptionViewData['id']) => void;
}

export const InquiryTypeChips = ({
  items,
  onPressItem,
}: InquiryTypeChipsProps) => {
  return (
    <View style={styles.wrap}>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={() => onPressItem(item.id)}
          style={[styles.chip, item.isSelected ? styles.chipSelected : undefined]}>
          <Text
            style={[
              styles.chipLabel,
              item.isSelected ? styles.chipLabelSelected : undefined,
            ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 17,
  },
  chipSelected: {
    backgroundColor: COLORS.brand.primaryTint,
    borderColor: COLORS.brand.primary,
  },
  chipLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  chipLabelSelected: {
    color: COLORS.brand.primaryStrong,
  },
});
