import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  FONT_FAMILIES,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

type CampusHomeHeaderProps = {
  onPressProfile: () => void;
  onPressNotification: () => void;
};

export const CampusHomeHeader = ({
  onPressProfile,
  onPressNotification,
}: CampusHomeHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>SKURI</Text>
      <View style={styles.rightButtonContainer}>
        <TouchableOpacity
          accessibilityLabel="알림"
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={onPressNotification}
          style={styles.button}>
          <Icon
            color={COLORS.text.secondary}
            name="notifications-outline"
            size={20}
          />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="프로필"
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={onPressProfile}
          style={styles.button}>
          <Icon color={COLORS.text.secondary} name="person-outline" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + SPACING.xs,
  },
  wordmark: {
    color: COLORS.text.primary,
    fontFamily: FONT_FAMILIES.brand.wordmark,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  rightButtonContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
    ...SHADOWS.card,
  },
});
