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

interface BoardDetailPopupMenuProps {
  onClose: () => void;
  onPressDelete: () => void;
  onPressEdit: () => void;
  onPressReport: () => void;
  right?: number;
  showManageActions?: boolean;
  top: number;
  visible: boolean;
}

export const BoardDetailPopupMenu = ({
  onClose,
  onPressDelete,
  onPressEdit,
  onPressReport,
  right = 12,
  showManageActions = true,
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
            color={COLORS.accent.orange}
            name="flag-outline"
            size={16}
          />
          <Text style={styles.rowLabel}>신고</Text>
        </TouchableOpacity>

        {showManageActions ? (
          <>
            <View style={styles.divider} />

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.82}
              onPress={() => {
                onClose();
                onPressEdit();
              }}
              style={styles.row}>
              <Icon color={COLORS.accent.blue} name="create-outline" size={16} />
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
              <Icon color={COLORS.status.danger} name="trash-outline" size={16} />
              <Text style={styles.deleteLabel}>삭제</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'absolute',
    width: 144,
    zIndex: 30,
    ...SHADOWS.raised,
  },
  deleteLabel: {
    color: COLORS.status.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    backgroundColor: COLORS.border.subtle,
    height: 1,
    marginHorizontal: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    height: 52,
    paddingHorizontal: SPACING.lg,
  },
  rowLabel: {
    color: COLORS.text.strong,
    fontSize: 14,
    lineHeight: 20,
  },
});
