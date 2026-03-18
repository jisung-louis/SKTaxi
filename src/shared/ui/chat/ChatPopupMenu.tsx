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
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface ChatPopupMenuProps {
  canReport?: boolean
  leaveLabel: string
  notificationEnabled: boolean
  onClose: () => void
  onLeave: () => void
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

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Pressable onPress={onClose} style={styles.overlay} />

      <View style={[styles.card, {right, top}]}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={onToggleNotification}
          style={styles.toggleRow}>
          <View style={styles.rowLabelGroup}>
            <Icon
              color={V2_COLORS.text.secondary}
              name="notifications-outline"
              size={15}
            />
            <Text style={styles.rowLabel}>알림</Text>
          </View>
          <TogglePill enabled={notificationEnabled} />
        </TouchableOpacity>

        {canReport && onReport ? <View style={styles.divider} /> : null}

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
              color={V2_COLORS.accent.orange}
              name="flag-outline"
              size={15}
            />
            <Text style={styles.rowLabel}>신고하기</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.divider} />

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={() => {
            onClose();
            onLeave();
          }}
          style={styles.actionRow}>
          <Icon color={V2_COLORS.status.danger} name="log-out-outline" size={15} />
          <Text style={styles.leaveLabel}>{leaveLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    height: 45,
    paddingHorizontal: V2_SPACING.lg,
  },
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'absolute',
    width: 176,
    zIndex: 20,
    ...V2_SHADOWS.raised,
  },
  divider: {
    backgroundColor: V2_COLORS.border.subtle,
    height: 1,
    marginHorizontal: V2_SPACING.md,
  },
  leaveLabel: {
    color: V2_COLORS.status.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  rowLabel: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    lineHeight: 20,
  },
  rowLabelGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 45,
    justifyContent: 'space-between',
    paddingHorizontal: V2_SPACING.lg,
  },
  toggleThumb: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.pill,
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
    borderRadius: V2_RADIUS.pill,
    height: 20,
    position: 'relative',
    width: 36,
  },
  toggleTrackDisabled: {
    backgroundColor: V2_COLORS.border.default,
  },
  toggleTrackEnabled: {
    backgroundColor: V2_COLORS.brand.primary,
  },
});
