import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '@/shared/design-system/tokens';

interface TimetableBottomSheetProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onClose: () => void;
  visible: boolean;
}

export const TimetableBottomSheet = ({
  children,
  contentContainerStyle,
  onClose,
  visible,
}: TimetableBottomSheetProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View style={styles.modalRoot}>
        <Pressable onPress={onClose} style={styles.backdrop} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}>
          <View
            style={[
              styles.sheet,
              {paddingBottom: Math.max(insets.bottom, V2_SPACING.lg)},
              contentContainerStyle,
            ]}>
            <View style={styles.handle} />
            <TouchableOpacity
              accessibilityLabel="닫기"
              accessibilityRole="button"
              activeOpacity={0.84}
              onPress={onClose}
              style={styles.closeButton}>
              <Icon color={V2_COLORS.text.secondary} name="close" size={20} />
            </TouchableOpacity>
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    backgroundColor: 'rgba(17, 24, 39, 0.22)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: V2_COLORS.background.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    minHeight: 240,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.sm,
    ...V2_SHADOWS.raised,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.pill,
    height: 5,
    marginBottom: V2_SPACING.md,
    width: 44,
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    marginBottom: V2_SPACING.md,
    width: 36,
  },
});
