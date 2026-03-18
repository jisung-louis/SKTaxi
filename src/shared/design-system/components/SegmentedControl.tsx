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
    <View style={[styles.containerBase, containerStyle, style, {borderRadius: isRounded ? V2_RADIUS.pill : V2_RADIUS.lg}]}>
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
            style={[styles.segment, selected ? segmentSelectedStyle : null, isFullWidth ? {flex: 1} : null, isRounded ? {borderRadius: V2_RADIUS.pill} : {borderRadius: V2_RADIUS.md}, {height: height}]}>
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
    gap: V2_SPACING.xs,
    padding: V2_SPACING.xs,
  },
  containerBrand: {
    backgroundColor: V2_COLORS.background.surface,
    ...V2_SHADOWS.card,
  },
  containerSurface: {
    backgroundColor: V2_COLORS.background.subtle,
  },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.md,
  },
  segmentSelectedBrand: {
    backgroundColor: V2_COLORS.brand.primary,
    ...V2_SHADOWS.card,
  },
  segmentSelectedSurface: {
    backgroundColor: V2_COLORS.background.surface,
    ...V2_SHADOWS.card,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  labelDefault: {
    color: V2_COLORS.text.muted,
  },
  labelSelectedBrand: {
    color: V2_COLORS.text.inverse,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  labelSelectedSurface: {
    color: V2_COLORS.text.primary,
  },
});
