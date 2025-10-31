import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';

interface TabBadgeProps {
  count: number;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
  location?: 'top' | 'bottom';
  size?: 'small' | 'medium' | 'large';
}

export const TabBadge: React.FC<TabBadgeProps> = ({ count, visible = true, style, location = 'top', size = 'medium' }) => {
  if (!visible || count <= 0) {
    return null;
  }

  return (
    <View style={[
      styles.badge, 
      location === 'top' ? { top: -2 } : { bottom: -2 }, 
      size === 'small' ? styles.small : size === 'medium' ? styles.medium : styles.large,
      style,
      ]}>
      <Text style={[
        styles.badgeText, 
        size === 'small' ? { ...TYPOGRAPHY.caption3 } : size === 'medium' ? { ...TYPOGRAPHY.caption2 } : { ...TYPOGRAPHY.caption1 }]}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    backgroundColor: COLORS.accent.red,
    borderRadius: 10,
    minWidth: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  badgeText: {
    color: 'white',
    fontWeight: '600',
  },
  small: {
    paddingHorizontal: 2,
    paddingVertical: 1,
    minWidth: 16,
    borderRadius: 8,
  },
  medium: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    borderRadius: 12,
  },
  large: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 20,
    borderRadius: 16,
  },
});
