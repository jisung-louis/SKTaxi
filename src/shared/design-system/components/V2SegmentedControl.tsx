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

export interface V2SegmentedControlItem<T extends string = string> {
  id: T;
  label: string;
}

interface V2SegmentedControlProps<T extends string = string> {
  items: ReadonlyArray<V2SegmentedControlItem<T>>;
  onSelect: (itemId: T) => void;
  selectedId: T;
  style?: StyleProp<ViewStyle>;
}

export const V2SegmentedControl = <T extends string>({
  items,
  onSelect,
  selectedId,
  style,
}: V2SegmentedControlProps<T>) => {
  return (
    <View style={[styles.container, style]}>
      {items.map(item => {
        const selected = item.id === selectedId;

        return (
          <TouchableOpacity
            key={item.id}
            accessibilityRole="button"
            activeOpacity={0.88}
            onPress={() => onSelect(item.id)}
            style={[styles.segment, selected ? styles.segmentSelected : null]}>
            <Text
              style={[
                styles.label,
                selected ? styles.labelSelected : styles.labelDefault,
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
  container: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    gap: V2_SPACING.xs,
    padding: V2_SPACING.xs,
    ...V2_SHADOWS.card,
  },
  segment: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.md,
    flex: 1,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.md,
  },
  segmentSelected: {
    backgroundColor: V2_COLORS.brand.primary,
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
  labelSelected: {
    color: V2_COLORS.text.inverse,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
});
