import React from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

interface TaxiHomeSearchBarProps {
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

export const TaxiHomeSearchBar = ({
  onChangeText,
  placeholder,
  value,
}: TaxiHomeSearchBarProps) => {
  return (
    <View style={styles.container}>
      <Icon color={COLORS.text.muted} name="search-outline" size={18} />
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.muted}
        returnKeyType="search"
        selectionColor={COLORS.brand.primary}
        style={styles.input}
        value={value}
      />
      {value ? (
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={() => onChangeText('')}>
          <Icon color={COLORS.text.muted} name="close-circle" size={18} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    height: 44,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.raised,
  },
  input: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
    paddingVertical: 0,
  },
});
