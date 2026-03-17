import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface OnboardingFeatureCardProps {
  iconColor: string;
  iconName: string;
  label: string;
}

export const OnboardingFeatureCard = ({
  iconColor,
  iconName,
  label,
}: OnboardingFeatureCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Icon color={iconColor} name={iconName} size={16} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    gap: 14,
    minHeight: 64,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: 14,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
    ...V2_SHADOWS.card,
  },
  label: {
    color: V2_COLORS.text.strong,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
