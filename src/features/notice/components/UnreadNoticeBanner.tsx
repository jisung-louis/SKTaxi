import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';

import { getUnreadNoticeBannerText } from '../model/selectors';

interface UnreadNoticeBannerProps {
  unreadCount: number;
  selectedCategory: string;
}

export function UnreadNoticeBanner({
  unreadCount,
  selectedCategory,
}: UnreadNoticeBannerProps) {
  const bannerOpacity = useSharedValue(1);

  useEffect(() => {
    bannerOpacity.value = 0;
    bannerOpacity.value = withTiming(1, { duration: 400 });
  }, [bannerOpacity, selectedCategory]);

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        bannerAnimatedStyle,
        styles.unreadHeader,
        unreadCount > 0 ? null : styles.unreadHeaderEmpty,
      ]}
    >
      <Icon
        name={unreadCount > 0 ? 'notifications' : 'checkmark-circle-outline'}
        size={16}
        color={unreadCount > 0 ? COLORS.accent.green : COLORS.text.disabled}
      />
      <Text
        style={[
          styles.unreadText,
          unreadCount > 0 ? null : styles.unreadTextMuted,
        ]}
      >
        {getUnreadNoticeBannerText({ selectedCategory, unreadCount })}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  unreadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.accent.green}10`,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  unreadHeaderEmpty: {
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  unreadText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    fontWeight: '600',
    marginLeft: 8,
  },
  unreadTextMuted: {
    color: COLORS.text.secondary,
  },
});
