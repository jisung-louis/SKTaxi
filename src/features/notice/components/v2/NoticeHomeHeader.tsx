import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface NoticeHomeHeaderProps {
  onPressAction: () => void;
  subtitle: string;
  title: string;
}

export const NoticeHomeHeader = ({
  onPressAction,
  subtitle,
  title,
}: NoticeHomeHeaderProps) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="공지 알림 설정 열기"
        activeOpacity={0.85}
        onPress={onPressAction}
        style={styles.actionButton}>
        <Icon
          color={V2_COLORS.text.secondary}
          name="search-outline"
          size={22}
        />
      </TouchableOpacity>
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
