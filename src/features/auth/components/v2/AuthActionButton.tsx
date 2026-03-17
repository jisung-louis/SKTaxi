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
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
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
          {shadowColor: colors?.[0] || V2_COLORS.brand.primary},
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
              color={isDisabled ? V2_COLORS.text.muted : V2_COLORS.text.inverse}
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
    borderRadius: V2_RADIUS.lg,
    width: '100%',
  },
  buttonInner: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.lg,
    height: 52,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: V2_SPACING.lg,
    width: '100%',
  },
  gradientButton: {
    ...V2_SHADOWS.floating,
  },
  disabledButton: {
    backgroundColor: V2_COLORS.border.default,
  },
  enabledLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  disabledLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
