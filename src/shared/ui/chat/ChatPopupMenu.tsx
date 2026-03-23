import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

interface ChatPopupMenuProps {
  canReport?: boolean
  canToggleNotification?: boolean
  leaveLabel: string
  notificationEnabled: boolean
  onClose: () => void
  onLeave?: () => void
  onReport?: () => void
  onToggleNotification: () => void
  right?: number
  top?: number
  visible: boolean
}

const TogglePill = ({enabled}: {enabled: boolean}) => {
  return (
    <View
      style={[
        styles.toggleTrack,
        enabled ? styles.toggleTrackEnabled : styles.toggleTrackDisabled,
      ]}>
      <View
        style={[
          styles.toggleThumb,
          enabled ? styles.toggleThumbEnabled : styles.toggleThumbDisabled,
        ]}
      />
    </View>
  );
};

export const ChatPopupMenu = ({
  canReport = false,
  canToggleNotification = true,
  leaveLabel,
  notificationEnabled,
  onClose,
  onLeave,
  onReport,
  onToggleNotification,
  right = 12,
  top = 64,
  visible,
}: ChatPopupMenuProps) => {
  if (!visible) {
    return null;
  }

  const showLeaveAction = Boolean(onLeave);
  const showNotificationAction = canToggleNotification;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Pressable onPress={onClose} style={styles.overlay} />

      <View style={[styles.card, {right, top}]}>
        {showNotificationAction ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={onToggleNotification}
            style={styles.toggleRow}>
            <View style={styles.rowLabelGroup}>
              <Icon
                color={COLORS.text.secondary}
                name="notifications-outline"
                size={15}
              />
              <Text style={styles.rowLabel}>알림</Text>
            </View>
            <TogglePill enabled={notificationEnabled} />
          </TouchableOpacity>
        ) : null}

        {showNotificationAction && canReport && onReport ? (
          <View style={styles.divider} />
        ) : null}

        {canReport && onReport ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => {
              onClose();
              onReport();
            }}
            style={styles.actionRow}>
            <Icon
              color={COLORS.accent.orange}
              name="flag-outline"
              size={15}
            />
            <Text style={styles.rowLabel}>신고하기</Text>
          </TouchableOpacity>
        ) : null}

        {showLeaveAction ? <View style={styles.divider} /> : null}

        {showLeaveAction ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => {
              onClose();
              onLeave?.();
            }}
            style={styles.actionRow}>
            <Icon
              color={COLORS.status.danger}
              name="log-out-outline"
              size={15}
            />
            <Text style={styles.leaveLabel}>{leaveLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    height: 45,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'absolute',
    width: 176,
    zIndex: 20,
    ...SHADOWS.raised,
  },
  divider: {
    backgroundColor: COLORS.border.subtle,
    height: 1,
    marginHorizontal: SPACING.md,
  },
  leaveLabel: {
    color: COLORS.status.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  rowLabel: {
    color: COLORS.text.strong,
    fontSize: 14,
    lineHeight: 20,
  },
  rowLabelGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 45,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  toggleThumb: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.pill,
    height: 16,
    position: 'absolute',
    top: 2,
    width: 16,
  },
  toggleThumbDisabled: {
    left: 2,
  },
  toggleThumbEnabled: {
    left: 18,
  },
  toggleTrack: {
    borderRadius: RADIUS.pill,
    height: 20,
    position: 'relative',
    width: 36,
  },
  toggleTrackDisabled: {
    backgroundColor: COLORS.border.default,
  },
  toggleTrackEnabled: {
    backgroundColor: COLORS.brand.primary,
  },
});
