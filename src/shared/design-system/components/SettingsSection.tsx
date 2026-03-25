import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '../tokens';

interface SettingsSectionProps {
  cardStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
}

export const SettingsSection = ({
  cardStyle,
  children,
  style,
  title,
}: SettingsSectionProps) => {
  return (
    <View style={style}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={[styles.card, cardStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    lineHeight: 16,
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
});
