import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
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
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    ...SHADOWS.card,
  },
  title: {
    color: COLORS.text.strong,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  description: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
