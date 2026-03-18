import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
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
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.md,
    flex: 1,
    minHeight: 84,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    ...SHADOWS.card,
  },
  valueLabel: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 4,
  },
  label: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
