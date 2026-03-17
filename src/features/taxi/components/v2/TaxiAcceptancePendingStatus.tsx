import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface TaxiAcceptancePendingStatusProps {
  description: string;
  title: string;
}

const LoadingDot = ({
  index,
  progress,
}: {
  index: number;
  progress: SharedValue<number>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const shiftedProgress = (progress.value - index / 3 + 1) % 1;

    return {
      opacity: interpolate(
        shiftedProgress,
        [0, 0.18, 0.36, 1],
        [0.3, 1, 0.3, 0.3],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            shiftedProgress,
            [0, 0.18, 0.36, 1],
            [0, -4, 0, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            shiftedProgress,
            [0, 0.18, 0.36, 1],
            [0.9, 1, 0.9, 0.9],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

export const TaxiAcceptancePendingStatus = ({
  description,
  title,
}: TaxiAcceptancePendingStatusProps) => {
  const rotation = useSharedValue(0);
  const dotProgress = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(1, {
        duration: 1400,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    dotProgress.value = 0;
    dotProgress.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [dotProgress, rotation]);

  const rotatingRingStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value * 360}deg`}],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.loaderWrap}>
        <View style={styles.loaderTrack} />
        <Animated.View style={[styles.loaderSpinner, rotatingRingStyle]} />
        <View style={styles.loaderCenter}>
          <Icon color={V2_COLORS.brand.primary} name="car-sport" size={28} />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.dotsRow}>
        {Array.from({length: 3}, (_, index) => (
          <LoadingDot index={index} key={index} progress={dotProgress} />
        ))}
      </View>

      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: V2_SPACING.md,
  },
  loaderWrap: {
    alignItems: 'center',
    height: 112,
    justifyContent: 'center',
    marginBottom: 32,
    width: 112,
  },
  loaderTrack: {
    ...StyleSheet.absoluteFillObject,
    borderColor: V2_COLORS.brand.primarySoft,
    borderRadius: V2_RADIUS.pill,
    borderWidth: 4,
  },
  loaderSpinner: {
    ...StyleSheet.absoluteFillObject,
    borderColor: 'transparent',
    borderRadius: V2_RADIUS.pill,
    borderRightColor: V2_COLORS.brand.primary,
    borderTopColor: V2_COLORS.brand.primary,
    borderWidth: 4,
  },
  loaderCenter: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderRadius: V2_RADIUS.pill,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: V2_SPACING.sm,
  },
  dotsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: V2_SPACING.lg,
  },
  dot: {
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.pill,
    height: 6,
    width: 6,
  },
  description: {
    color: V2_COLORS.text.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
