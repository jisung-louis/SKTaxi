import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import type {CommunityChatRoomViewData} from '../model/communityViewData';

interface CommunityChatRoomCardProps {
  item: CommunityChatRoomViewData;
  onPress: (roomId: string) => void;
}

export const CommunityChatRoomCard = ({
  item,
  onPress,
}: CommunityChatRoomCardProps) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.88}
      onPress={() => onPress(item.id)}
      style={styles.card}>
      <View
        style={[styles.iconWrap, {backgroundColor: item.iconBackgroundColor}]}>
        <Icon color={item.iconColor} name={item.iconName} size={24} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {item.title}
          </Text>
          <Text style={styles.timeLabel}>{item.timeLabel}</Text>
        </View>

        <View style={styles.subtitleRow}>
          <Text numberOfLines={1} style={styles.subtitle}>
            {item.subtitle}
          </Text>
          {item.unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.memberCountLabel}>{item.memberCountLabel}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    gap: V2_SPACING.md,
    marginBottom: V2_SPACING.md,
    minHeight: 96,
    padding: V2_SPACING.lg,
    ...V2_SHADOWS.card,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: V2_SPACING.xs,
  },
  title: {
    color: V2_COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginRight: V2_SPACING.sm,
  },
  timeLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  subtitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: V2_SPACING.xs,
  },
  subtitle: {
    color: V2_COLORS.text.secondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginRight: V2_SPACING.sm,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.pill,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 6,
  },
  badgeLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  memberCountLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
