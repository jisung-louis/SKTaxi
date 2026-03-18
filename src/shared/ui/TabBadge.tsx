import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_TYPOGRAPHY,
} from '@/shared/design-system/tokens';

interface TabBadgeProps {
  count: number;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
  location?: 'top' | 'bottom';
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean; // 숫자 대신 점만 표시할 때 false
}

export const TabBadge: React.FC<TabBadgeProps> = ({
  count,
  visible = true,
  style,
  location = 'top',
  size = 'medium',
  showNumber = true,
}) => {
  if (!visible || count <= 0) {
    return null;
  }

  const isDot = !showNumber;

  return (
    <View
      style={[
        styles.badge,
        location === 'top' ? styles.topLocation : styles.bottomLocation,
        size === 'small' ? styles.small : size === 'medium' ? styles.medium : styles.large,
        isDot && styles.dot,
        style,
      ]}
    >
      {isDot ? null : (
        <Text
          style={[
            styles.badgeText,
            size === 'small'
              ? { ...V2_TYPOGRAPHY.caption3 }
              : size === 'medium'
              ? { ...V2_TYPOGRAPHY.caption2 }
              : { ...V2_TYPOGRAPHY.caption1 },
          ]}
        >
          {count > 99 ? '99+' : count.toString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    backgroundColor: V2_COLORS.status.danger,
    borderRadius: V2_RADIUS.md,
    minWidth: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: V2_COLORS.background.page,
  },
  topLocation: {
    top: -2,
  },
  bottomLocation: {
    bottom: -2,
  },
  badgeText: {
    color: V2_COLORS.text.inverse,
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
  dot: {
    minWidth: 10,
    height: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 8,
  },
});
