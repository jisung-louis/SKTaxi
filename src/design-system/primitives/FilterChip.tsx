import React from 'react';
import {
  type Insets,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { v2Colors, v2Radius, v2Typography } from '../foundation';
import { DISABLED_STATE_STYLE, PRESSED_STATE_STYLE } from './utils';

const DEFAULT_HIT_SLOP: Insets = {
  bottom: 4,
  left: 4,
  right: 4,
  top: 4,
};

export interface FilterChipProps {
  disabled?: boolean;
  hitSlop?: Insets;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const FilterChip = ({
  disabled = false,
  hitSlop = DEFAULT_HIT_SLOP,
  label,
  labelStyle,
  onPress,
  selected = false,
  style,
  testID,
}: FilterChipProps) => {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.default,
        disabled && styles.disabled,
        disabled && DISABLED_STATE_STYLE,
        pressed && !disabled && PRESSED_STATE_STYLE,
        style,
      ]}
      testID={testID}
    >
      <Text style={[styles.label, selected ? styles.selectedLabel : styles.defaultLabel, disabled && styles.disabledLabel, labelStyle]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: v2Radius.full,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  default: {
    backgroundColor: v2Colors.bg.subtle,
  },
  defaultLabel: {
    color: v2Colors.text.secondary,
  },
  disabled: {
    backgroundColor: v2Colors.bg.subtle,
  },
  disabledLabel: {
    color: v2Colors.text.quaternary,
  },
  label: {
    ...v2Typography.body.medium,
    textAlign: 'center',
  },
  selected: {
    backgroundColor: v2Colors.accent.green.base,
  },
  selectedLabel: {
    color: v2Colors.text.inverse,
  },
});
