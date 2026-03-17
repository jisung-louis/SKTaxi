import React from 'react';
import {
  ActivityIndicator,
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
      {isDisabled || !colors ? (
        <View style={[styles.buttonBase, styles.disabledButton]}>
          {loading ? (
            <ActivityIndicator color={V2_COLORS.text.muted} size="small" />
          ) : (
            <Text style={styles.disabledLabel}>{label}</Text>
          )}
        </View>
      ) : (
        <LinearGradient
          colors={colors}
          end={{x: 1, y: 1}}
          start={{x: 0, y: 0}}
          style={[styles.buttonBase, styles.gradientButton]}>
          {loading ? (
            <ActivityIndicator color={V2_COLORS.text.inverse} size="small" />
          ) : (
            <Text style={styles.enabledLabel}>{label}</Text>
          )}
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  buttonBase: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.lg,
    height: 52,
    justifyContent: 'center',
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
