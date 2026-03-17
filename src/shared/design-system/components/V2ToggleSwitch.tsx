import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {V2_COLORS, V2_RADIUS} from '../tokens';

interface V2ToggleSwitchProps {
  accessibilityLabel?: string;
  disabled?: boolean;
  offThumbAlignment?: 'left' | 'right';
  onValueChange?: (nextValue: boolean) => void;
  value: boolean;
}

export const V2ToggleSwitch = ({
  accessibilityLabel,
  disabled = false,
  offThumbAlignment = 'left',
  onValueChange,
  value,
}: V2ToggleSwitchProps) => {
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
      <View
        style={[
          styles.thumb,
          value
            ? styles.thumbOn
            : offThumbAlignment === 'right'
              ? styles.thumbOffRight
              : styles.thumbOffLeft,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: V2_RADIUS.pill,
    height: 24,
    width: 44,
  },
  trackOn: {
    backgroundColor: V2_COLORS.brand.primary,
  },
  trackOff: {
    backgroundColor: V2_COLORS.border.default,
  },
  trackDisabled: {
    opacity: 0.55,
  },
  thumb: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.pill,
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
  thumbOffLeft: {
    left: 2,
  },
  thumbOffRight: {
    left: 28,
  },
});
