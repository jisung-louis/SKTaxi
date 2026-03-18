import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, RADIUS, SHADOWS, SPACING} from '../tokens';

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
      <Icon color={COLORS.text.tertiary} name={iconName} size={14} />
      <Text style={styles.countLabel}>{count}</Text>
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
  countLabel: {
    color: COLORS.text.tertiary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
