import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';

interface TabBadgeProps {
  count: number;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const TabBadge: React.FC<TabBadgeProps> = ({ count, visible = true, style }) => {
  if (!visible || count <= 0) {
    return null;
  }

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: COLORS.accent.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: 'white',
    fontWeight: '600',
    fontSize: 11,
  },
});
