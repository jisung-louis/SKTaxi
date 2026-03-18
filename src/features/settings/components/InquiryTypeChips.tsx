import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SPACING,
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
    gap: V2_SPACING.sm,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.pill,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 17,
  },
  chipSelected: {
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderColor: V2_COLORS.brand.primary,
  },
  chipLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  chipLabelSelected: {
    color: V2_COLORS.brand.primaryStrong,
  },
});
