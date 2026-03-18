import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
} from '@/shared/design-system/tokens';

interface CafeteriaReactionChipProps {
  countLabel: string;
  iconName: string;
}

export const CafeteriaReactionChip = ({
  countLabel,
  iconName,
}: CafeteriaReactionChipProps) => {
  return (
    <View style={styles.container}>
      <Icon color={V2_COLORS.text.tertiary} name={iconName} size={12} />
      <Text style={styles.countLabel}>{countLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.sm,
    flexDirection: 'row',
    gap: 4,
    height: 28,
    paddingHorizontal: 10,
  },
  countLabel: {
    color: V2_COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
