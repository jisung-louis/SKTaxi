import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { v2Colors, v2Radius, v2Typography } from '../foundation';
import { PRESSED_STATE_STYLE } from './utils';

export interface UnreadNoticeBannerProps {
  actionLabel?: string;
  count: number;
  description?: string;
  onPressAction?: () => void;
  style?: StyleProp<ViewStyle>;
  title?: string;
}

export const UnreadNoticeBanner = ({
  actionLabel = '보기',
  count,
  description,
  onPressAction,
  style,
  title = '읽지 않은 공지',
}: UnreadNoticeBannerProps) => {
  const bodyText =
    description ?? (count > 0 ? `${count}개의 새로운 공지가 있어요` : '새 공지가 없습니다');

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leadingSection}>
        <View style={styles.iconBadge}>
          <Icon color={v2Colors.text.inverse} name="notifications-outline" size={16} />
        </View>
        <View style={styles.copySection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{bodyText}</Text>
        </View>
      </View>
      <Pressable
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        onPress={onPressAction}
        style={({ pressed }) => [styles.actionButton, pressed && PRESSED_STATE_STYLE]}
      >
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: v2Colors.bg.surface,
    borderRadius: v2Radius.md,
    height: 28,
    justifyContent: 'center',
    minWidth: 46,
    paddingHorizontal: 12,
  },
  actionLabel: {
    ...v2Typography.meta.medium,
    color: v2Colors.status.unread.text,
  },
  container: {
    alignItems: 'center',
    backgroundColor: v2Colors.status.unread.surface,
    borderColor: v2Colors.status.unread.border,
    borderRadius: v2Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 62,
    padding: 13,
  },
  copySection: {
    flex: 1,
  },
  description: {
    ...v2Typography.meta.default,
    color: v2Colors.status.unread.body,
    marginTop: 2,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: v2Colors.accent.green.base,
    borderRadius: v2Radius.full,
    height: 32,
    justifyContent: 'center',
    marginRight: 8,
    width: 32,
  },
  leadingSection: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: 12,
  },
  title: {
    ...v2Typography.body.medium,
    color: v2Colors.status.unread.title,
    fontWeight: '700',
  },
});
