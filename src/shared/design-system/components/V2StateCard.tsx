import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '../tokens';

interface V2StateCardProps {
  actionLabel?: string;
  description: string;
  icon: React.ReactNode;
  onPressAction?: () => void;
  style?: ViewStyle;
  title: string;
}

export const V2StateCard = ({
  actionLabel,
  description,
  icon,
  onPressAction,
  style,
  title,
}: V2StateCardProps) => {
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
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: V2_SPACING.xl,
    paddingVertical: V2_SPACING.xxl,
    ...V2_SHADOWS.card,
  },
  icon: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginBottom: V2_SPACING.md,
    width: 32,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: V2_SPACING.xs,
    textAlign: 'center',
  },
  description: {
    color: V2_COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderRadius: V2_RADIUS.pill,
    marginTop: V2_SPACING.lg,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.sm,
  },
  actionLabel: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
