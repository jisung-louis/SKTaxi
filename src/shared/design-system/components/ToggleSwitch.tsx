import React from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {COLORS, RADIUS} from '../tokens';

interface ToggleSwitchProps {
  accessibilityLabel?: string;
  disabled?: boolean;
  onValueChange?: (nextValue: boolean) => void;
  pressable?: boolean;
  size?: 'compact' | 'default' | 'large';
  value: boolean;
}

const TOGGLE_SIZE = {
  compact: {
    inset: 2,
    thumbSize: 16,
    trackHeight: 20,
    trackWidth: 36,
    travelDistance: 16,
  },
  default: {
    inset: 2,
    thumbSize: 20,
    trackHeight: 24,
    trackWidth: 44,
    travelDistance: 20,
  },
  large: {
    inset: 4,
    thumbSize: 20,
    trackHeight: 28,
    trackWidth: 48,
    travelDistance: 20,
  },
} as const;

export const ToggleSwitch = ({
  accessibilityLabel,
  disabled = false,
  onValueChange,
  pressable = true,
  size = 'default',
  value,
}: ToggleSwitchProps) => {
  const progress = React.useRef(new Animated.Value(value ? 1 : 0)).current;
  const toggleSize = TOGGLE_SIZE[size];

  React.useEffect(() => {
    const animation = Animated.spring(progress, {
      damping: 18,
      mass: 0.9,
      stiffness: 220,
      toValue: value ? 1 : 0,
      useNativeDriver: false,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [progress, value]);

  const animatedTrackStyle = {
    backgroundColor: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.border.default, COLORS.brand.primary],
    }),
  };

  const animatedThumbStyle = {
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, toggleSize.travelDistance],
        }),
      },
    ],
  };

  const track = (
    <Animated.View
      style={[
        styles.track,
        {
          borderRadius: toggleSize.trackHeight / 2,
          height: toggleSize.trackHeight,
          width: toggleSize.trackWidth,
        },
        animatedTrackStyle,
        disabled ? styles.trackDisabled : undefined,
      ]}>
      <Animated.View
        style={[
          styles.thumb,
          {
            borderRadius: toggleSize.thumbSize / 2,
            height: toggleSize.thumbSize,
            left: toggleSize.inset,
            top: toggleSize.inset,
            width: toggleSize.thumbSize,
          },
          animatedThumbStyle,
        ]}
      />
    </Animated.View>
  );

  if (!pressable) {
    return track;
  }

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{checked: value, disabled}}
      activeOpacity={0.88}
      disabled={disabled || !onValueChange}
      onPress={() => onValueChange?.(!value)}>
      {track}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: RADIUS.pill,
  },
  trackDisabled: {
    opacity: 0.55,
  },
  thumb: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.pill,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
});
