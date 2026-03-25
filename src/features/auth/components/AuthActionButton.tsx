import React from 'react';
import {
  ActivityIndicator,
  StyleSheet as RNStyleSheet,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

interface AuthActionButtonProps {
  colors?: [string, string];
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
}

export const AuthActionButton = ({
  colors,
  disabled = false,
  label,
  loading = false,
  onPress,
}: AuthActionButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.9}
      disabled={isDisabled}
      onPress={onPress}
      style={styles.touchable}>
      <View
        style={[
          styles.buttonOuter,
          isDisabled ? styles.disabledButton : styles.gradientButton,
          {shadowColor: colors?.[0] || COLORS.brand.primary},
        ]}>
        <View style={styles.buttonInner}>
          {!isDisabled && colors ? (
            <LinearGradient
              colors={colors}
              end={{x: 1, y: 1}}
              pointerEvents="none"
              start={{x: 0, y: 0}}
              style={RNStyleSheet.absoluteFill}
            />
          ) : null}

          {loading ? (
            <ActivityIndicator
              color={isDisabled ? COLORS.text.muted : COLORS.text.inverse}
              size="small"
            />
          ) : (
            <Text style={isDisabled ? styles.disabledLabel : styles.enabledLabel}>
              {label}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  buttonOuter: {
    borderRadius: RADIUS.lg,
    width: '100%',
  },
  buttonInner: {
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    height: 52,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: SPACING.lg,
    width: '100%',
  },
  gradientButton: {
    ...SHADOWS.floating,
  },
  disabledButton: {
    backgroundColor: COLORS.border.default,
  },
  enabledLabel: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  disabledLabel: {
    color: COLORS.text.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
