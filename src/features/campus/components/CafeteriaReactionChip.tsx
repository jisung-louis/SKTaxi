import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
} from '@/shared/design-system/tokens';

interface CafeteriaReactionChipProps {
  countLabel: string;
  disabled?: boolean;
  iconName: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export const CafeteriaReactionChip = ({
  countLabel,
  disabled = false,
  iconName,
  isSelected = false,
  onPress,
}: CafeteriaReactionChipProps) => {
  const isPositiveChip = iconName === 'thumbs-up-outline';
  const selectedBackgroundColor = isPositiveChip
    ? COLORS.brand.primaryTint
    : COLORS.accent.orangeSoft;
  const selectedTextColor = isPositiveChip
    ? COLORS.brand.primaryStrong
    : COLORS.accent.orange;
  const containerStyle = [
    styles.container,
    isSelected
      ? {backgroundColor: selectedBackgroundColor}
      : undefined,
    disabled ? styles.disabled : undefined,
  ];
  const countLabelStyle = [
    styles.countLabel,
    isSelected ? {color: selectedTextColor} : undefined,
  ];
  const iconColor = isSelected ? selectedTextColor : COLORS.text.tertiary;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={containerStyle}>
      <Icon color={iconColor} name={iconName} size={12} />
      <Text style={countLabelStyle}>{countLabel}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    gap: 4,
    height: 28,
    paddingHorizontal: 10,
  },
  countLabel: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
