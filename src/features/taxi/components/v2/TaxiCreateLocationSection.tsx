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
} from 'react-native-reanimated';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
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

const CUSTOM_OPTION_LABEL = '직접 입력';

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
    <Animated.View layout={LinearTransition.springify()} style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chips}>
        {options.flat().map(option => {
          const isDisabled = disabledLabel === option;
          const isSelected = mode === 'preset' && selectedLabel === option;

          return (
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={isDisabled ? 1 : 0.84}
              disabled={isDisabled}
              key={option}
              onPress={() => onPressPreset(option)}
              style={[
                styles.chip,
                isSelected && styles.selectedChip,
                isDisabled && styles.disabledChip,
              ]}>
              <Text
                style={[
                  styles.chipLabel,
                  isSelected && styles.selectedChipLabel,
                  isDisabled && styles.disabledChipLabel,
                ]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onPressCustom}
          style={[styles.chip, mode === 'custom' && styles.selectedChip]}>
          <Text
            style={[
              styles.chipLabel,
              mode === 'custom' && styles.selectedChipLabel,
            ]}>
            {CUSTOM_OPTION_LABEL}
          </Text>
        </TouchableOpacity>
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
            placeholderTextColor={V2_COLORS.text.muted}
            selectionColor={V2_COLORS.brand.primary}
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
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    padding: V2_SPACING.lg,
    ...V2_SHADOWS.card,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: V2_SPACING.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: V2_SPACING.sm,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  selectedChip: {
    backgroundColor: V2_COLORS.brand.primary,
    borderColor: V2_COLORS.brand.primary,
  },
  disabledChip: {
    backgroundColor: V2_COLORS.background.subtle,
    borderColor: V2_COLORS.border.subtle,
  },
  chipLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  selectedChipLabel: {
    color: V2_COLORS.text.inverse,
  },
  disabledChipLabel: {
    color: V2_COLORS.text.muted,
  },
  inputShell: {
    marginTop: V2_SPACING.md,
  },
  input: {
    backgroundColor: V2_COLORS.background.subtle,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.md,
    borderWidth: 1,
    color: V2_COLORS.text.primary,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    minHeight: 52,
    paddingHorizontal: V2_SPACING.md,
    paddingVertical: 14,
  },
});
