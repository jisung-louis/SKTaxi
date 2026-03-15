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
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
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
      [V2_COLORS.background.surface, V2_COLORS.brand.primary],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [V2_COLORS.border.default, V2_COLORS.brand.primary],
    ),
    transform: [{scale: interpolate(progress.value, [0, 1], [1, 1.02])}],
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [V2_COLORS.text.secondary, V2_COLORS.text.inverse],
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
                  color={V2_COLORS.text.inverse}
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
          placeholderTextColor={V2_COLORS.text.muted}
          selectionColor={V2_COLORS.brand.primary}
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
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    padding: V2_SPACING.lg,
    ...V2_SHADOWS.card,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: V2_SPACING.md,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: V2_SPACING.sm,
  },
  tagChip: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.pill,
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
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderRadius: V2_RADIUS.md,
    marginTop: V2_SPACING.md,
    padding: V2_SPACING.md,
  },
  selectedTagsLabel: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: V2_SPACING.sm,
  },
  selectedTagBadge: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  selectedTagBadgeLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  customInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    marginTop: V2_SPACING.md,
  },
  customInput: {
    backgroundColor: V2_COLORS.background.subtle,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.md,
    borderWidth: 1,
    color: V2_COLORS.text.primary,
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: V2_SPACING.md,
    paddingVertical: 10,
  },
  addButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.md,
    justifyContent: 'center',
    minWidth: 68,
    paddingHorizontal: 14,
  },
  addButtonDisabled: {
    backgroundColor: V2_COLORS.background.subtle,
  },
  addButtonLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  addButtonLabelDisabled: {
    color: V2_COLORS.text.muted,
  },
});
