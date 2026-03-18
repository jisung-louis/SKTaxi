import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import type {MyPageStatViewData} from '../../model/myPageViewData';

interface MyPageStatCardProps {
  item: MyPageStatViewData;
  onPress?: (item: MyPageStatViewData) => void;
}

export const MyPageStatCard = ({item, onPress}: MyPageStatCardProps) => {
  const content = (
    <>
      <Text style={styles.valueLabel}>{item.valueLabel}</Text>
      <Text style={styles.label}>{item.label}</Text>
    </>
  );

  if (!onPress) {
    return <View style={styles.card}>{content}</View>;
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.88}
      onPress={() => onPress(item)}
      style={styles.card}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.md,
    flex: 1,
    minHeight: 84,
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.md,
    ...V2_SHADOWS.card,
  },
  valueLabel: {
    color: V2_COLORS.text.primary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 4,
  },
  label: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
