import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {COLORS, RADIUS, SHADOWS, SPACING} from '../tokens';

interface StateCardProps {
  actionLabel?: string;
  description: string;
  icon: React.ReactNode;
  onPressAction?: () => void;
  style?: ViewStyle;
  title: string;
}

export const StateCard = ({
  actionLabel,
  description,
  icon,
  onPressAction,
  style,
  title,
}: StateCardProps) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onPressAction ? (
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={onPressAction}
          style={styles.actionButton}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
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
  icon: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginBottom: SPACING.md,
    width: 32,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  description: {
    color: COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: COLORS.brand.primaryTint,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  actionLabel: {
    color: COLORS.brand.primaryStrong,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
