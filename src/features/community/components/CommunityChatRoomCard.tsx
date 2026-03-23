import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
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

        <View style={styles.statusRow}>
          <Text numberOfLines={1} style={styles.description}>
            {item.description}
          </Text>
          <View
            style={[
              styles.statusPill,
              {backgroundColor: item.statusBackgroundColor},
            ]}>
            <Text style={[styles.statusLabel, {color: item.statusTextColor}]}>
              {item.statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.subtitleRow}>
          <Text numberOfLines={1} style={styles.subtitle}>
            {item.previewLabel}
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
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    minHeight: 96,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  description: {
    color: COLORS.text.secondary,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    marginRight: SPACING.sm,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
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
    marginBottom: SPACING.xs,
  },
  title: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginRight: SPACING.sm,
  },
  timeLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  subtitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  statusPill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.text.secondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginRight: SPACING.sm,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.pill,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 6,
  },
  badgeLabel: {
    color: COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  memberCountLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
