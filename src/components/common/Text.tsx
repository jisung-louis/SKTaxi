import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption';
type TextColor = 'primary' | 'secondary' | 'disabled' | 'error' | 'success' | 'warning';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  style?: TextStyle;
  bold?: boolean;
  center?: boolean;
}

export const Text = ({
  children,
  variant = 'body1',
  color = 'primary',
  style,
  bold = false,
  center = false,
}: TextProps) => {
  const getTextStyle = () => {
    const baseStyle = styles[variant];
    const colorStyle = styles[`${color}Color`];
    const boldStyle = bold ? styles.bold : {};
    const centerStyle = center ? styles.center : {};

    return [baseStyle, colorStyle, boldStyle, centerStyle, style];
  };

  return <RNText style={getTextStyle()}>{children}</RNText>;
};

const styles = StyleSheet.create({
  // Variants
  h1: {
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    lineHeight: 24,
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Colors
  primaryColor: {
    color: COLORS.text.primary,
  },
  secondaryColor: {
    color: COLORS.text.secondary,
  },
  disabledColor: {
    color: COLORS.text.disabled,
  },
  errorColor: {
    color: COLORS.error,
  },
  successColor: {
    color: COLORS.success,
  },
  warningColor: {
    color: COLORS.warning,
  },
  // Modifiers
  bold: {
    fontWeight: 'bold',
  },
  center: {
    textAlign: 'center',
  },
});

export default Text; 