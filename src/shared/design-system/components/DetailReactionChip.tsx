import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '../tokens';

interface DetailReactionChipProps {
  count: number;
  iconName: string;
}

export const DetailReactionChip = ({
  count,
  iconName,
}: DetailReactionChipProps) => {
  return (
    <View style={styles.container}>
      <Icon color={V2_COLORS.text.tertiary} name={iconName} size={14} />
      <Text style={styles.countLabel}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.pill,
    flexDirection: 'row',
    gap: 6,
    height: 36,
    paddingHorizontal: V2_SPACING.lg,
    ...V2_SHADOWS.card,
  },
  countLabel: {
    color: V2_COLORS.text.tertiary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
