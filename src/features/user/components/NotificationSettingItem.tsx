import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typhograpy';

interface NotificationSettingItemProps {
  title: string;
  description: string;
  icon: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const NotificationSettingItem = ({
  description,
  disabled = false,
  icon,
  onValueChange,
  title,
  value,
}: NotificationSettingItemProps) => {
  return (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon
            name={icon}
            size={20}
            color={disabled ? COLORS.text.disabled : COLORS.accent.green}
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
          <Text
            style={[styles.settingDescription, disabled && styles.disabledText]}
          >
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: COLORS.border.default,
          true: `${COLORS.accent.green}40`,
        }}
        thumbColor={value ? COLORS.accent.green : COLORS.text.disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.accent.green}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  disabledText: {
    color: COLORS.text.disabled,
  },
});

