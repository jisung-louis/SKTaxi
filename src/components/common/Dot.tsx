import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface DotProps {
  visible?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}

export const Dot: React.FC<DotProps> = ({ visible = true, size = 'medium', style }) => {
  if (!visible) return null;

  const sizeStyle =
    size === 'small' ? styles.small : size === 'large' ? styles.large : styles.medium;

  return <View style={[styles.dot, sizeStyle, style]} />;
};

const styles = StyleSheet.create({
  dot: {
    backgroundColor: COLORS.accent.red,
    borderRadius: 8,
  },
  small: {
    width: 8,
    height: 8,
  },
  medium: {
    width: 10,
    height: 10,
  },
  large: {
    width: 12,
    height: 12,
  },
});


