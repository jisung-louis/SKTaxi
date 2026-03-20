import React from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

interface TaxiChatBottomSheetProps {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  onClose: () => void;
  visible: boolean;
}

export const TaxiChatBottomSheet = ({
  children,
  contentStyle,
  onClose,
  visible,
}: TaxiChatBottomSheetProps) => {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View style={styles.overlayWrap}>
        <Pressable onPress={onClose} style={styles.overlay} />

        <View style={[styles.sheet, contentStyle]}>
          <View style={styles.handle} />
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  handle: {
    alignSelf: 'center',
    backgroundColor: COLORS.border.default,
    borderRadius: RADIUS.pill,
    height: 4,
    marginBottom: SPACING.lg,
    width: 40,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayWrap: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 32,
  },
});
