import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
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

interface TaxiCreateTagSectionProps {
  customTagInput: string;
  selectedTags: string[];
  tagOptions: readonly string[];
  onAddCustomTag: () => void;
  onChangeCustomTagInput: (value: string) => void;
  onRemoveTag: (tag: string) => void;
  onTogglePresetTag: (tag: string) => void;
}

interface TaxiCreateTagChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const TaxiCreateTagChip = ({
  label,
  selected,
  onPress,
}: TaxiCreateTagChipProps) => {
  const progress = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, {duration: 180});
  }, [progress, selected]);

  const animatedChipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.background.surface, COLORS.brand.primary],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.border.default, COLORS.brand.primary],
    ),
    transform: [{scale: interpolate(progress.value, [0, 1], [1, 1.02])}],
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.text.secondary, COLORS.text.inverse],
    ),
  }));

  return (
    <AnimatedTouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.84}
      onPress={onPress}
      style={[styles.tagChip, animatedChipStyle]}>
      <Animated.Text style={[styles.tagChipLabel, animatedLabelStyle]}>
        {label}
      </Animated.Text>
    </AnimatedTouchableOpacity>
  );
};

export const TaxiCreateTagSection = React.memo(({
  customTagInput,
  selectedTags,
  tagOptions,
  onAddCustomTag,
  onChangeCustomTagInput,
  onRemoveTag,
  onTogglePresetTag,
}: TaxiCreateTagSectionProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>태그</Text>

      <View style={styles.tagsWrap}>
        {tagOptions.map(tag => {
          const isSelected = selectedTags.includes(tag);

          return (
            <TaxiCreateTagChip
              key={tag}
              label={tag}
              selected={isSelected}
              onPress={() => onTogglePresetTag(tag)}
            />
          );
        })}
      </View>

      {selectedTags.length > 0 ? (
        <View style={styles.selectedTagsSection}>
          <Text style={styles.selectedTagsLabel}>선택된 태그</Text>

          <View style={styles.tagsWrap}>
            {selectedTags.map(tag => (
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.84}
                key={tag}
                onPress={() => onRemoveTag(tag)}
                style={styles.selectedTagBadge}>
                <Text style={styles.selectedTagBadgeLabel}>{tag}</Text>
                <Icon
                  color={COLORS.text.inverse}
                  name="close-circle"
                  size={14}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.customInputRow}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="태그 직접 입력 (예: 빠른탑승)"
          placeholderTextColor={COLORS.text.muted}
          selectionColor={COLORS.brand.primary}
          style={styles.customInput}
          value={customTagInput}
          onChangeText={onChangeCustomTagInput}
        />
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={customTagInput.trim() ? 0.84 : 1}
          disabled={!customTagInput.trim()}
          onPress={onAddCustomTag}
          style={[
            styles.addButton,
            !customTagInput.trim() && styles.addButtonDisabled,
          ]}>
          <Text
            style={[
              styles.addButtonLabel,
              !customTagInput.trim() && styles.addButtonLabelDisabled,
            ]}>
            추가
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

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
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tagChip: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tagChipLabel: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  selectedTagsSection: {
    backgroundColor: COLORS.brand.primaryTint,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  selectedTagsLabel: {
    color: COLORS.brand.primaryStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  selectedTagBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  selectedTagBadgeLabel: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  customInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  customInput: {
    backgroundColor: COLORS.background.subtle,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 15,
    lineHeight: 16,
    minHeight: 48,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  addButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    minWidth: 68,
    paddingHorizontal: 14,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.background.subtle,
  },
  addButtonLabel: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  addButtonLabelDisabled: {
    color: COLORS.text.muted,
  },
});
