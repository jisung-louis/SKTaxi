import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
}

const Card = ({
  children,
  onPress,
  style,
  variant = 'elevated',
}: CardProps) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, styles[variant], style]}
      onPress={onPress}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  elevated: {
    backgroundColor: COLORS.background.primary,
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  filled: {
    backgroundColor: COLORS.background.card,
  },
});

export default Card; 