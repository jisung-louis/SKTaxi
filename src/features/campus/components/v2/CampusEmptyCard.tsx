import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

type CampusEmptyCardProps = {
  title: string;
  description: string;
};

export const CampusEmptyCard = ({
  title,
  description,
}: CampusEmptyCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: V2_SPACING.xl,
    paddingVertical: V2_SPACING.xxl,
    ...V2_SHADOWS.card,
  },
  title: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: V2_SPACING.xs,
    textAlign: 'center',
  },
  description: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
