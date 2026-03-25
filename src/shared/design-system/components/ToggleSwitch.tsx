import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {COLORS, RADIUS} from '../tokens';

interface ToggleSwitchProps {
  accessibilityLabel?: string;
  disabled?: boolean;
  onValueChange?: (nextValue: boolean) => void;
  value: boolean;
}

export const ToggleSwitch = ({
  accessibilityLabel,
  disabled = false,
  onValueChange,
  value,
}: ToggleSwitchProps) => {
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{checked: value, disabled}}
      activeOpacity={0.88}
      disabled={disabled || !onValueChange}
      onPress={() => onValueChange?.(!value)}
      style={[
        styles.track,
        value ? styles.trackOn : styles.trackOff,
        disabled ? styles.trackDisabled : undefined,
      ]}>
      <View style={[ styles.thumb, value ? styles.thumbOn : styles.thumbOff]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: RADIUS.pill,
    height: 24,
    width: 44,
  },
  trackOn: {
    backgroundColor: COLORS.brand.primary,
  },
  trackOff: {
    backgroundColor: COLORS.border.default,
  },
  trackDisabled: {
    opacity: 0.55,
  },
  thumb: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.pill,
    height: 20,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 2,
    top: 2,
    width: 20,
  },
  thumbOn: {
    left: 22,
  },
  thumbOff: {
    left: 2,
  },
});
