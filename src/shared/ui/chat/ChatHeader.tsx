import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {ChatThreadHeaderViewData} from './types';

interface ChatHeaderProps {
  header: ChatThreadHeaderViewData
  onPressBack: () => void
  onPressMenu?: () => void
}

export const ChatHeader = ({
  header,
  onPressBack,
  onPressMenu,
}: ChatHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top, minHeight: insets.top + 56}]}>
      <TouchableOpacity
        accessibilityLabel="뒤로 가기"
        accessibilityRole="button"
        activeOpacity={0.82}
        onPress={onPressBack}
        style={styles.iconButton}>
        <Icon color={COLORS.text.primary} name="arrow-back" size={22} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View
          style={[
            styles.roomIconWrap,
            {backgroundColor: header.iconBackgroundColor},
          ]}>
          <Icon color={header.iconColor} name={header.iconName} size={15} />
        </View>

        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={styles.title}>
            {header.title}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {header.subtitle}
          </Text>
        </View>
      </View>

      {onPressMenu ? (
        <TouchableOpacity
          accessibilityLabel="채팅 메뉴 열기"
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={onPressMenu}
          style={styles.iconButton}>
          <Icon color={COLORS.text.secondary} name="ellipsis-vertical" size={18} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: 4,
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  roomIconWrap: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  subtitle: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 15,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  titleWrap: {
    flex: 1,
    gap: 1,
  },
});
