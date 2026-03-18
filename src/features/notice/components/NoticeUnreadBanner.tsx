import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {NoticeHomeBannerViewData} from '../../model/noticeHomeViewData';
import {COLORS, RADIUS, SPACING} from '@/shared/design-system/tokens';

interface NoticeUnreadBannerProps {
  banner: NoticeHomeBannerViewData;
  onPressAction?: () => void;
}

export const NoticeUnreadBanner = ({
  banner,
  onPressAction,
}: NoticeUnreadBannerProps) => {
  return (
    <View
      style={[
        styles.container,
        banner.hasUnread ? styles.containerActive : styles.containerInactive,
      ]}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconBadge,
            banner.hasUnread
              ? styles.iconBadgeActive
              : styles.iconBadgeInactive,
          ]}>
          <Icon
            color={
              banner.hasUnread ? COLORS.text.inverse : COLORS.text.muted
            }
            name={banner.hasUnread ? 'notifications' : 'checkmark-done-outline'}
            size={14}
          />
        </View>
        <View>
          <Text
            style={[
              styles.title,
              banner.hasUnread ? styles.titleActive : styles.titleInactive,
            ]}>
            {banner.title}
          </Text>
          <Text
            style={[
              styles.description,
              banner.hasUnread
                ? styles.descriptionActive
                : styles.descriptionInactive,
            ]}>
            {banner.description}
          </Text>
        </View>
      </View>
      {banner.actionLabel && onPressAction ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="읽지 않은 공지 보기"
          activeOpacity={0.85}
          onPress={onPressAction}
          style={styles.actionButton}>
          <Text style={styles.actionLabel}>{banner.actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 62,
    padding: 13,
  },
  containerActive: {
    backgroundColor: COLORS.brand.primaryTint,
    borderColor: COLORS.border.accent,
  },
  containerInactive: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  iconBadgeActive: {
    backgroundColor: COLORS.brand.primary,
  },
  iconBadgeInactive: {
    backgroundColor: COLORS.background.subtle,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  titleActive: {
    color: '#14532D',
  },
  titleInactive: {
    color: COLORS.text.primary,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  descriptionActive: {
    color: COLORS.brand.primaryStrong,
  },
  descriptionInactive: {
    color: COLORS.text.secondary,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.sm,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  actionLabel: {
    color: COLORS.brand.primaryStrong,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
