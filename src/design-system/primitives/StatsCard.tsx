import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { v2Colors, v2Radius, v2Typography } from '../foundation';
import { resolveV2Shadow } from './utils';

export interface StatsCardProps {
  label: string;
  style?: StyleProp<ViewStyle>;
  value: string;
}

export const StatsCard = ({ label, style, value }: StatsCardProps) => {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...resolveV2Shadow('card'),
    alignItems: 'center',
    backgroundColor: v2Colors.bg.surface,
    borderColor: v2Colors.border.subtle,
    borderRadius: v2Radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 84,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  label: {
    ...v2Typography.meta.default,
    color: v2Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  value: {
    ...v2Typography.stat.large,
    color: v2Colors.text.primary,
    textAlign: 'center',
  },
});
