import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '../tokens';

export interface FilterChipItem<T extends string = string> {
  id: T;
  label: string;
  selected: boolean;
}

interface FilterChipsProps<T extends string = string> {
  inactiveVariant?: 'subtle' | 'surface';
  items: FilterChipItem<T>[];
  onPressItem: (itemId: T) => void;
  style?: StyleProp<ViewStyle>;
}

export const FilterChips = <T extends string>({
  inactiveVariant = 'subtle',
  items,
  onPressItem,
  style,
}: FilterChipsProps<T>) => {
  const inactiveStyle =
    inactiveVariant === 'surface'
      ? styles.chipSurfaceInactive
      : styles.chipSubtleInactive;

  return (
    <View style={[styles.row, style]}>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={() => onPressItem(item.id)}
          style={[
            styles.chip,
            item.selected ? styles.chipSelected : inactiveStyle,
          ]}>
          <Text
            style={[
              styles.label,
              item.selected ? styles.labelSelected : styles.labelDefault,
            ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  chip: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.lg,
  },
  chipSelected: {
    backgroundColor: V2_COLORS.brand.primary,
  },
  chipSubtleInactive: {
    backgroundColor: V2_COLORS.background.subtle,
  },
  chipSurfaceInactive: {
    backgroundColor: V2_COLORS.background.surface,
    ...V2_SHADOWS.card,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  labelDefault: {
    color: V2_COLORS.text.secondary,
  },
  labelSelected: {
    color: V2_COLORS.text.inverse,
  },
});
