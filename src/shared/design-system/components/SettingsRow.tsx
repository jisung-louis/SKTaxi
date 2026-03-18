import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SPACING,
} from '../tokens';
import {ToggleSwitch} from './ToggleSwitch';

interface SettingsRowProps {
  accessibilityLabel?: string;
  accessoryType: 'chevron' | 'toggle' | 'value';
  disabled?: boolean;
  iconBackgroundColor: string;
  iconBoxSize?: number;
  iconColor: string;
  iconName: string;
  minHeight?: number;
  onPress?: () => void;
  onToggle?: (nextValue: boolean) => void;
  showDivider?: boolean;
  subtitle?: string;
  subtitleNumberOfLines?: number;
  title: string;
  titleWeight?: '500' | '700';
  toggleValue?: boolean;
  valueLabel?: string;
}

export const SettingsRow = ({
  accessibilityLabel,
  accessoryType,
  disabled = false,
  iconBackgroundColor,
  iconBoxSize = 40,
  iconColor,
  iconName,
  minHeight = 72,
  onPress,
  onToggle,
  showDivider = false,
  subtitle,
  subtitleNumberOfLines = 1,
  title,
  titleWeight = '500',
  toggleValue = false,
  valueLabel,
}: SettingsRowProps) => {
  const content = (
    <>
      <View style={styles.leftGroup}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: iconBackgroundColor,
              borderRadius: Math.min(iconBoxSize / 3, V2_RADIUS.md),
              height: iconBoxSize,
              width: iconBoxSize,
            },
          ]}>
          <Icon color={iconColor} name={iconName} size={20} />
        </View>

        <View style={styles.textGroup}>
          <Text
            style={[
              styles.title,
              titleWeight === '700' ? styles.titleStrong : undefined,
              disabled ? styles.disabledText : undefined,
            ]}>
            {title}
          </Text>

          {subtitle ? (
            <Text
              numberOfLines={subtitleNumberOfLines}
              style={[
                styles.subtitle,
                disabled ? styles.disabledText : undefined,
                subtitleNumberOfLines >= 2
                  ? styles.subtitleOverOneLine
                  : styles.subtitleOneLine,
              ]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {accessoryType === 'chevron' ? (
        <Icon
          color={disabled ? V2_COLORS.border.default : V2_COLORS.text.muted}
          name="chevron-forward"
          size={16}
        />
      ) : null}

      {accessoryType === 'value' ? (
        <Text style={styles.valueLabel}>{valueLabel}</Text>
      ) : null}

      {accessoryType === 'toggle' ? (
        <ToggleSwitch
          accessibilityLabel={accessibilityLabel ?? title}
          disabled={disabled}
          onValueChange={onToggle}
          value={toggleValue}
        />
      ) : null}
    </>
  );

  if (accessoryType === 'chevron' && onPress) {
    return (
      <TouchableOpacity
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityRole="button"
        activeOpacity={0.82}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.row,
          {minHeight},
          showDivider ? styles.divider : undefined,
          disabled ? styles.disabledRow : undefined,
        ]}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.row,
        {minHeight},
        showDivider ? styles.divider : undefined,
        disabled ? styles.disabledRow : undefined,
      ]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.lg,
  },
  divider: {
    borderBottomColor: V2_COLORS.border.subtle,
    borderBottomWidth: 1,
  },
  disabledRow: {
    opacity: 0.56,
  },
  leftGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: V2_SPACING.md,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: V2_SPACING.md,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  titleStrong: {
    fontWeight: '700',
  },
  subtitle: {
    color: V2_COLORS.text.muted,
    marginTop: 2,
  },
  valueLabel: {
    color: V2_COLORS.text.tertiary,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: V2_SPACING.md,
  },
  disabledText: {
    color: V2_COLORS.text.muted,
  },
  subtitleOneLine: {
    fontSize: 12,
    lineHeight: 16,
  },
  subtitleOverOneLine: {
    fontSize: 10,
    lineHeight: 14,
  },
});
