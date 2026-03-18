import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_TYPOGRAPHY,
} from '@/shared/design-system/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) => {
  const getButtonStyle = () => {
    const baseStyle = styles.button;
    const variantStyle = styles[variant];
    const sizeStyle = styles[size];
    const disabledStyle = disabled ? styles.disabled : {};

    return [baseStyle, variantStyle, sizeStyle, disabledStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = styles.text;
    const variantTextStyle = styles[`${variant}Text`];
    const sizeTextStyle = styles[`${size}Text`];
    const disabledTextStyle = disabled ? styles.disabledText : {};

    return [baseStyle, variantTextStyle, sizeTextStyle, disabledTextStyle, textStyle];
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary'
              ? V2_COLORS.text.inverse
              : V2_COLORS.brand.primary
          }
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: V2_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Variants
  primary: {
    backgroundColor: V2_COLORS.brand.primary,
  },
  secondary: {
    backgroundColor: V2_COLORS.background.surface,
    borderWidth: 1,
    borderColor: V2_COLORS.border.default,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: V2_COLORS.brand.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  // Sizes
  small: {
    height: 36,
    paddingHorizontal: 12,
  },
  medium: {
    height: 48,
    paddingHorizontal: 16,
  },
  large: {
    height: 56,
    paddingHorizontal: 24,
  },
  // Text styles
  text: {
    ...V2_TYPOGRAPHY.body1,
    fontWeight: '600',
  },
  primaryText: {
    color: V2_COLORS.text.inverse,
  },
  secondaryText: {
    color: V2_COLORS.brand.primary,
  },
  outlineText: {
    color: V2_COLORS.brand.primary,
  },
  ghostText: {
    color: V2_COLORS.brand.primary,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default Button;
