import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {COLORS, RADIUS, SHADOWS, SPACING} from '../tokens';

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
    gap: SPACING.sm,
  },
  chip: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  chipSelected: {
    backgroundColor: COLORS.brand.primary,
  },
  chipSubtleInactive: {
    backgroundColor: COLORS.background.subtle,
  },
  chipSurfaceInactive: {
    backgroundColor: COLORS.background.surface,
    ...SHADOWS.card,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  labelDefault: {
    color: COLORS.text.secondary,
  },
  labelSelected: {
    color: COLORS.text.inverse,
  },
});
