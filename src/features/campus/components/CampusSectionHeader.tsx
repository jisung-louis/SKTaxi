import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {COLORS, SPACING} from '@/shared/design-system/tokens';

type CampusSectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export const CampusSectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onPressAction,
}: CampusSectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onPressAction ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onPressAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  subtitle: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  action: {
    color: COLORS.brand.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
