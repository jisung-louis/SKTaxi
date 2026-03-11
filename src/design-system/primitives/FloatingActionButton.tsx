import React from 'react';
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { v2Colors, v2Radius } from '../foundation';
import { DISABLED_STATE_STYLE, PRESSED_STATE_STYLE, resolveV2Shadow } from './utils';

export interface FloatingActionButtonProps {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const FloatingActionButton = ({
  accessibilityLabel,
  disabled = false,
  icon,
  onPress,
  style,
  testID,
}: FloatingActionButtonProps) => {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && DISABLED_STATE_STYLE,
        pressed && !disabled && PRESSED_STATE_STYLE,
        style,
      ]}
      testID={testID}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    ...resolveV2Shadow('fab'),
    alignItems: 'center',
    backgroundColor: v2Colors.accent.green.base,
    borderRadius: v2Radius.full,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
});
