import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '../tokens';

interface V2PageHeaderProps {
  actionAccessibilityLabel?: string;
  actionIconName?: string;
  actionIconSize?: number;
  onPressAction?: () => void;
  subtitle: string;
  title: string;
}

export const V2PageHeader = ({
  actionAccessibilityLabel = '열기',
  actionIconName = 'search-outline',
  actionIconSize = 22,
  onPressAction,
  subtitle,
  title,
}: V2PageHeaderProps) => {
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
            color={V2_COLORS.text.secondary}
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
    paddingBottom: V2_SPACING.lg,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: V2_SPACING.xs,
  },
  subtitle: {
    color: V2_COLORS.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
    ...V2_SHADOWS.card,
  },
});
