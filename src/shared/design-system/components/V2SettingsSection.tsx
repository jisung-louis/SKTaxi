import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '../tokens';

interface V2SettingsSectionProps {
  cardStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
}

export const V2SettingsSection = ({
  cardStyle,
  children,
  style,
  title,
}: V2SettingsSectionProps) => {
  return (
    <View style={style}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={[styles.card, cardStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    lineHeight: 16,
    marginBottom: V2_SPACING.sm,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    overflow: 'hidden',
    ...V2_SHADOWS.card,
  },
});
