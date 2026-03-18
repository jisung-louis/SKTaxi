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

interface BoardDetailPopupMenuProps {
  onClose: () => void;
  onPressDelete: () => void;
  onPressEdit: () => void;
  onPressReport: () => void;
  right?: number;
  top: number;
  visible: boolean;
}

export const BoardDetailPopupMenu = ({
  onClose,
  onPressDelete,
  onPressEdit,
  onPressReport,
  right = 12,
  top,
  visible,
}: BoardDetailPopupMenuProps) => {
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
          onPress={() => {
            onClose();
            onPressReport();
          }}
          style={styles.row}>
          <Icon
            color={V2_COLORS.accent.orange}
            name="flag-outline"
            size={16}
          />
          <Text style={styles.rowLabel}>신고</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={() => {
            onClose();
            onPressEdit();
          }}
          style={styles.row}>
          <Icon color={V2_COLORS.accent.blue} name="create-outline" size={16} />
          <Text style={styles.rowLabel}>수정</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={() => {
            onClose();
            onPressDelete();
          }}
          style={styles.row}>
          <Icon color={V2_COLORS.status.danger} name="trash-outline" size={16} />
          <Text style={styles.deleteLabel}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'absolute',
    width: 144,
    zIndex: 30,
    ...V2_SHADOWS.raised,
  },
  deleteLabel: {
    color: V2_COLORS.status.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    backgroundColor: V2_COLORS.border.subtle,
    height: 1,
    marginHorizontal: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.md,
    height: 52,
    paddingHorizontal: V2_SPACING.lg,
  },
  rowLabel: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    lineHeight: 20,
  },
});
