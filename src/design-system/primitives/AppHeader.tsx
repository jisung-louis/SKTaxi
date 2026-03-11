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

import { v2Border, v2Colors, v2Radius, v2Typography } from '../foundation';
import { DISABLED_STATE_STYLE, PRESSED_STATE_STYLE } from './utils';

export interface AppHeaderAction {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: React.ReactNode;
  onPress?: () => void;
  testID?: string;
}

export interface AppHeaderProps {
  actions?: readonly AppHeaderAction[];
  leftAction?: AppHeaderAction;
  showBorder?: boolean;
  style?: StyleProp<ViewStyle>;
  title: string;
  titleStyle?: StyleProp<TextStyle>;
}

interface AppHeaderIconButtonProps {
  action: AppHeaderAction;
  style?: StyleProp<ViewStyle>;
}

const AppHeaderIconButton = ({ action, style }: AppHeaderIconButtonProps) => {
  const disabled = action.disabled || !action.onPress;

  return (
    <Pressable
      accessibilityLabel={action.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.iconButton,
        disabled && DISABLED_STATE_STYLE,
        pressed && !disabled && PRESSED_STATE_STYLE,
        style,
      ]}
      testID={action.testID}
    >
      {action.icon}
    </Pressable>
  );
};

export const AppHeader = ({
  actions = [],
  leftAction,
  showBorder = true,
  style,
  title,
  titleStyle,
}: AppHeaderProps) => {
  return (
    <View style={[styles.container, showBorder && styles.border, style]}>
      <View style={styles.leadingSection}>
        {leftAction ? (
          <AppHeaderIconButton action={leftAction} style={styles.leftAction} />
        ) : null}
        <Text numberOfLines={1} style={[styles.title, titleStyle]}>
          {title}
        </Text>
      </View>
      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <AppHeaderIconButton
              action={action}
              key={`${action.accessibilityLabel}-${index}`}
              style={index > 0 ? styles.actionGap : undefined}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  actionGap: {
    marginLeft: 8,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 12,
  },
  border: {
    borderBottomColor: v2Border.rule.header.color,
    borderBottomWidth: v2Border.rule.header.width,
  },
  container: {
    alignItems: 'center',
    backgroundColor: v2Colors.bg.surface,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: v2Radius.full,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  leadingSection: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  leftAction: {
    marginRight: 8,
  },
  title: {
    ...v2Typography.title.screen,
    color: v2Colors.text.primary,
    flexShrink: 1,
  },
});
