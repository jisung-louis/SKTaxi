import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, RADIUS, SHADOWS, SPACING} from '../tokens';

interface DetailReactionChipProps {
  accessibilityLabel?: string;
  active?: boolean;
  count: number;
  disabled?: boolean;
  iconName: string;
  onPress?: () => void;
}

export const DetailReactionChip = ({
  accessibilityLabel,
  active = false,
  count,
  disabled = false,
  iconName,
  onPress,
}: DetailReactionChipProps) => {
  const content = (
    <>
      <Icon
        color={active ? COLORS.brand.primaryStrong : COLORS.text.tertiary}
        name={iconName}
        size={14}
      />
      <Text
        style={[
          styles.countLabel,
          active ? styles.countLabelActive : undefined,
        ]}>
        {count}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        activeOpacity={disabled ? 1 : 0.82}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.container,
          active ? styles.containerActive : undefined,
          disabled ? styles.containerDisabled : undefined,
        ]}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.container,
        active ? styles.containerActive : undefined,
      ]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    gap: 6,
    height: 36,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.card,
  },
  containerActive: {
    backgroundColor: COLORS.brand.primaryTint,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  countLabel: {
    color: COLORS.text.tertiary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  countLabelActive: {
    color: COLORS.brand.primaryStrong,
  },
});
