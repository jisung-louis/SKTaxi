import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  V2_COLORS,
  V2_RADIUS,
} from '@/shared/design-system/tokens';

interface AuthFeatureChipProps {
  label: string;
}

export const AuthFeatureChip = ({label}: AuthFeatureChipProps) => {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  label: {
    color: V2_COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
