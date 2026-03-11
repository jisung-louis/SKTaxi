import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { v2Colors, v2Typography } from '../foundation';
import { DISABLED_STATE_STYLE, PRESSED_STATE_STYLE } from './utils';

export interface SectionHeaderProps {
  actionAccessibilityLabel?: string;
  actionLabel?: string;
  actionStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  onPressAction?: () => void;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  subtitleStyle?: StyleProp<TextStyle>;
  title: string;
  titleStyle?: StyleProp<TextStyle>;
}

export const SectionHeader = ({
  actionAccessibilityLabel,
  actionLabel,
  actionStyle,
  disabled = false,
  onPressAction,
  style,
  subtitle,
  subtitleStyle,
  title,
  titleStyle,
}: SectionHeaderProps) => {
  const hasAction = Boolean(actionLabel);
  const actionDisabled = disabled || !onPressAction;

  return (
    <View style={[styles.container, subtitle ? styles.containerExpanded : styles.containerCompact, style]}>
      <View style={styles.copySection}>
        <Text numberOfLines={1} style={[styles.title, titleStyle]}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[styles.subtitle, subtitleStyle]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {hasAction ? (
        <Pressable
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: actionDisabled }}
          disabled={actionDisabled}
          hitSlop={8}
          onPress={onPressAction}
          style={({ pressed }) => [
            styles.actionButton,
            actionDisabled && DISABLED_STATE_STYLE,
            pressed && !actionDisabled && PRESSED_STATE_STYLE,
          ]}
        >
          <Text style={[styles.actionLabel, actionStyle]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    justifyContent: 'center',
    marginLeft: 12,
    minHeight: 20,
  },
  actionLabel: {
    ...v2Typography.body.medium,
    color: v2Colors.accent.green.base,
    textAlign: 'center',
  },
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  containerCompact: {
    minHeight: 24,
  },
  containerExpanded: {
    minHeight: 42,
  },
  copySection: {
    flex: 1,
  },
  subtitle: {
    ...v2Typography.meta.default,
    color: v2Colors.text.quaternary,
    marginTop: 2,
  },
  title: {
    ...v2Typography.title.section,
    color: v2Colors.text.primary,
  },
});
