import React from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
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
      <Icon color={V2_COLORS.text.muted} name="search-outline" size={18} />
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={V2_COLORS.text.muted}
        returnKeyType="search"
        selectionColor={V2_COLORS.brand.primary}
        style={styles.input}
        value={value}
      />
      {value ? (
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={() => onChangeText('')}>
          <Icon color={V2_COLORS.text.muted} name="close-circle" size={18} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.md,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    height: 44,
    paddingHorizontal: V2_SPACING.lg,
    ...V2_SHADOWS.raised,
  },
  input: {
    color: V2_COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    paddingVertical: 0,
  },
});
