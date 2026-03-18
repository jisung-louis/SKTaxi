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

export interface SegmentedControlItem<T extends string = string> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string = string> {
  items: ReadonlyArray<SegmentedControlItem<T>>;
  onSelect: (itemId: T) => void;
  selectedId: T;
  style?: StyleProp<ViewStyle>;
  variant?: 'brand' | 'surface';
  isFullWidth?: boolean;
  isRounded?: boolean;
  height?: number;
}

export const SegmentedControl = <T extends string>({
  items,
  onSelect,
  selectedId,
  style,
  variant = 'brand',
  isFullWidth = true,
  isRounded = false,
  height = 40,
}: SegmentedControlProps<T>) => {
  const containerStyle =
    variant === 'surface' ? styles.containerSurface : styles.containerBrand;

  return (
    <View style={[styles.containerBase, containerStyle, style, {borderRadius: isRounded ? RADIUS.pill : RADIUS.lg}]}>
      {items.map(item => {
        const selected = item.id === selectedId;
        const segmentSelectedStyle =
          variant === 'surface'
            ? styles.segmentSelectedSurface
            : styles.segmentSelectedBrand;
        const labelSelectedStyle =
          variant === 'surface'
            ? styles.labelSelectedSurface
            : styles.labelSelectedBrand;

        return (
          <TouchableOpacity
            key={item.id}
            accessibilityRole="button"
            activeOpacity={0.88}
            onPress={() => onSelect(item.id)}
            style={[styles.segment, selected ? segmentSelectedStyle : null, isFullWidth ? {flex: 1} : null, isRounded ? {borderRadius: RADIUS.pill} : {borderRadius: RADIUS.md}, {height: height}]}>
            <Text
              style={[
                styles.label,
                selected ? labelSelectedStyle : styles.labelDefault,
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  containerBase: {
    flexDirection: 'row',
    gap: SPACING.xs,
    padding: SPACING.xs,
  },
  containerBrand: {
    backgroundColor: COLORS.background.surface,
    ...SHADOWS.card,
  },
  containerSurface: {
    backgroundColor: COLORS.background.subtle,
  },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  segmentSelectedBrand: {
    backgroundColor: COLORS.brand.primary,
    ...SHADOWS.card,
  },
  segmentSelectedSurface: {
    backgroundColor: COLORS.background.surface,
    ...SHADOWS.card,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  labelDefault: {
    color: COLORS.text.muted,
  },
  labelSelectedBrand: {
    color: COLORS.text.inverse,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  labelSelectedSurface: {
    color: COLORS.text.primary,
  },
});
