import React from 'react';
import {
  Animated,
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
  const overlayOpacity = React.useRef(new Animated.Value(visible ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(overlayOpacity, {
      duration: 180,
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [overlayOpacity, visible]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View style={styles.overlayWrap}>
        <Animated.View
          pointerEvents="none"
          style={[styles.overlayBackdrop, {opacity: overlayOpacity}]}
        />
        <Pressable onPress={onClose} style={styles.overlay} />

        <View style={[styles.sheet, contentStyle]}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  overlayWrap: {
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
