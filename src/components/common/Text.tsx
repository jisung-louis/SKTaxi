import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface TextProps extends RNTextProps {
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({ style, ...props }) => {
  return (
    <RNText
      style={[styles.text, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  text: {
    color: COLORS.text,
    fontSize: 16,
  },
}); 