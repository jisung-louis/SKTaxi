import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {NoticeHomeBannerViewData} from '../../model/noticeHomeViewData';
import {V2_COLORS, V2_RADIUS, V2_SPACING} from '@/shared/design-system/tokens';

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
              banner.hasUnread ? V2_COLORS.text.inverse : V2_COLORS.text.muted
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
    borderRadius: V2_RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 62,
    padding: 13,
  },
  containerActive: {
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderColor: V2_COLORS.border.accent,
  },
  containerInactive: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  iconBadgeActive: {
    backgroundColor: V2_COLORS.brand.primary,
  },
  iconBadgeInactive: {
    backgroundColor: V2_COLORS.background.subtle,
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
    color: V2_COLORS.text.primary,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  descriptionActive: {
    color: V2_COLORS.brand.primaryStrong,
  },
  descriptionInactive: {
    color: V2_COLORS.text.secondary,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.sm,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.md,
  },
  actionLabel: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
