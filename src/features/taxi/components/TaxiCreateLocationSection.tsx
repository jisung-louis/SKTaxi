import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

interface TaxiCreateLocationSectionProps {
  customPlaceholder: string;
  customValue: string;
  disabledLabel: string | null;
  mode: 'preset' | 'custom';
  options: readonly string[][];
  selectedLabel: string;
  title: string;
  onChangeCustomValue: (value: string) => void;
  onPressCustom: () => void;
  onPressPreset: (label: string) => void;
}

interface TaxiCreateLocationChipProps {
  disabled?: boolean;
  label: string;
  selected: boolean;
  onPress: () => void;
}

const CUSTOM_OPTION_LABEL = '직접 입력';
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const DISABLED_CHIP_TEXT_COLOR = '#D1D5DB';

const TaxiCreateLocationChip = ({
  disabled = false,
  label,
  selected,
  onPress,
}: TaxiCreateLocationChipProps) => {
  const selectedProgress = useSharedValue(selected ? 1 : 0);
  const disabledProgress = useSharedValue(disabled ? 1 : 0);

  React.useEffect(() => {
    selectedProgress.value = withTiming(selected ? 1 : 0, {duration: 180});
  }, [selected, selectedProgress]);

  React.useEffect(() => {
    disabledProgress.value = withTiming(disabled ? 1 : 0, {duration: 180});
  }, [disabled, disabledProgress]);

  const animatedChipStyle = useAnimatedStyle(
    () => {
      const baseBackgroundColor = interpolateColor(
        selectedProgress.value,
        [0, 1],
        [COLORS.background.surface, COLORS.brand.primary],
      );
      const baseBorderColor = interpolateColor(
        selectedProgress.value,
        [0, 1],
        [COLORS.border.default, COLORS.brand.primary],
      );
      const baseScale = interpolate(selectedProgress.value, [0, 1], [1, 1.02]);

      return {
        backgroundColor: interpolateColor(
          disabledProgress.value,
          [0, 1],
          [baseBackgroundColor, COLORS.background.subtle],
        ),
        borderColor: interpolateColor(
          disabledProgress.value,
          [0, 1],
          [baseBorderColor, COLORS.border.subtle],
        ),
        transform: [
          {
            scale: interpolate(disabledProgress.value, [0, 1], [baseScale, 1]),
          },
        ],
      };
    },
    [],
  );

  const animatedLabelStyle = useAnimatedStyle(() => {
    const baseTextColor = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [COLORS.text.secondary, COLORS.text.inverse],
    );

    return {
      color: interpolateColor(
        disabledProgress.value,
        [0, 1],
        [baseTextColor, DISABLED_CHIP_TEXT_COLOR],
      ),
    };
  });

  return (
    <AnimatedTouchableOpacity
      accessibilityRole="button"
      activeOpacity={disabled ? 1 : 0.84}
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, animatedChipStyle]}>
      <Animated.Text style={[styles.chipLabel, animatedLabelStyle]}>
        {label}
      </Animated.Text>
    </AnimatedTouchableOpacity>
  );
};

export const TaxiCreateLocationSection = ({
  customPlaceholder,
  customValue,
  disabledLabel,
  mode,
  options,
  selectedLabel,
  title,
  onChangeCustomValue,
  onPressCustom,
  onPressPreset,
}: TaxiCreateLocationSectionProps) => {
  return (
    <Animated.View layout={LinearTransition.damping(10)} style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chips}>
        {options.flat().map(option => {
          const isDisabled = disabledLabel === option;
          const isSelected = mode === 'preset' && selectedLabel === option;

          return (
            <TaxiCreateLocationChip
              disabled={isDisabled}
              key={option}
              label={option}
              selected={isSelected}
              onPress={() => onPressPreset(option)}
            />
          );
        })}

        <TaxiCreateLocationChip
          label={CUSTOM_OPTION_LABEL}
          selected={mode === 'custom'}
          onPress={onPressCustom}
        />
      </View>

      {mode === 'custom' ? (
        <Animated.View
          entering={FadeInDown.duration(180)}
          exiting={FadeOutUp.duration(140)}
          layout={LinearTransition.springify()}
          style={styles.inputShell}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={customPlaceholder}
            placeholderTextColor={COLORS.text.muted}
            selectionColor={COLORS.brand.primary}
            style={styles.input}
            value={customValue}
            onChangeText={onChangeCustomValue}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipLabel: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  inputShell: {
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background.subtle,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    minHeight: 48,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
});
