import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, RADIUS, SHADOWS, SPACING} from '../tokens';

interface PageHeaderProps {
  actionAccessibilityLabel?: string;
  actionIconName?: string;
  actionIconSize?: number;
  onPressAction?: () => void;
  subtitle: string;
  title: string;
}

export const PageHeader = ({
  actionAccessibilityLabel = '열기',
  actionIconName = 'search-outline',
  actionIconSize = 22,
  onPressAction,
  subtitle,
  title,
}: PageHeaderProps) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {onPressAction ? (
        <TouchableOpacity
          accessibilityLabel={actionAccessibilityLabel}
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={onPressAction}
          style={styles.actionButton}>
          <Icon
            color={COLORS.text.secondary}
            name={actionIconName}
            size={actionIconSize}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.lg,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
    ...SHADOWS.card,
  },
});
