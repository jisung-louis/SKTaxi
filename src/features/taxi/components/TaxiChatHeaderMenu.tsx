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

interface TaxiChatHeaderMenuProps {
  canCancelParty: boolean;
  canEditParty: boolean;
  canLeave: boolean;
  destructiveActionLabel: string;
  notificationEnabled: boolean;
  onPressDestructiveAction: () => void;
  onClose: () => void;
  onEditParty: () => void;
  onLeaveParty: () => void;
  onToggleNotification: () => void;
  visible: boolean;
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

export const TaxiChatHeaderMenu = ({
  canCancelParty,
  canEditParty,
  canLeave,
  destructiveActionLabel,
  notificationEnabled,
  onPressDestructiveAction,
  onClose,
  onEditParty,
  onLeaveParty,
  onToggleNotification,
  visible,
}: TaxiChatHeaderMenuProps) => {
  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Pressable onPress={onClose} style={styles.overlay} />

      <View style={styles.card}>
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

        {canEditParty ? <View style={styles.divider} /> : null}

        {canEditParty ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => {
              onClose();
              onEditParty();
            }}
            style={styles.actionRow}>
            <Icon color={COLORS.text.secondary} name="create-outline" size={15} />
            <Text style={styles.rowLabel}>수정하기</Text>
          </TouchableOpacity>
        ) : null}

        {canCancelParty ? <View style={styles.divider} /> : null}

        {canCancelParty ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => {
              onClose();
              onPressDestructiveAction();
            }}
            style={styles.actionRow}>
            <Icon color={COLORS.status.danger} name="close-circle-outline" size={15} />
            <Text style={styles.leaveLabel}>{destructiveActionLabel}</Text>
          </TouchableOpacity>
        ) : null}

        {canLeave ? <View style={styles.divider} /> : null}

        {canLeave ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => {
              onClose();
              onLeaveParty();
            }}
            style={styles.actionRow}>
            <Icon color={COLORS.status.danger} name="log-out-outline" size={15} />
            <Text style={styles.leaveLabel}>파티 나가기</Text>
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
    right: 12,
    top: 64,
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
