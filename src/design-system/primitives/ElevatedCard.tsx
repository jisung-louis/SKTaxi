import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { v2Colors, v2Radius } from '../foundation';
import { DISABLED_STATE_STYLE, PRESSED_STATE_STYLE, resolveV2Shadow } from './utils';

export interface ElevatedCardProps {
  accessibilityLabel?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ElevatedCard = ({
  accessibilityLabel,
  children,
  disabled = false,
  onPress,
  padding = 16,
  style,
  testID,
}: ElevatedCardProps) => {
  const cardStyle = [styles.card, { padding }, style];

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          disabled && DISABLED_STATE_STYLE,
          pressed && !disabled && PRESSED_STATE_STYLE,
        ]}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...resolveV2Shadow('card'),
    backgroundColor: v2Colors.bg.surface,
    borderColor: v2Colors.border.subtle,
    borderRadius: v2Radius.xl,
    borderWidth: 1,
  },
});
