import React from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import {StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '@/shared/design-system/tokens';

interface TimetableBottomSheetProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onClose: () => void;
  snapPoints: Array<string | number>;
  visible: boolean;
  keyboardBehavior?: BottomSheetModalProps['keyboardBehavior'];
}

export const TimetableBottomSheet = ({
  children,
  contentContainerStyle,
  onClose,
  snapPoints,
  visible,
  keyboardBehavior = 'interactive',
}: TimetableBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const modalRef = React.useRef<BottomSheetModal>(null);

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.14}
        pressBehavior="close"
      />
    ),
    [],
  );

  React.useEffect(() => {
    const modal = modalRef.current;

    if (!modal) {
      return;
    }

    if (visible) {
      modal.present();
      return;
    }

    modal.dismiss();
  }, [visible]);

  const handleDismiss = React.useCallback(() => {
    if (visible) {
      onClose();
    }
  }, [onClose, visible]);

  return (
    <BottomSheetModal
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      enableDynamicSizing={false}
      enableOverDrag={false}
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      handleStyle={styles.handle}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior="restore"
      onDismiss={handleDismiss}
      ref={modalRef}
      snapPoints={snapPoints}
      stackBehavior="replace"
      style={styles.sheet}>
      <BottomSheetView
        style={[
          styles.content,
          {paddingBottom: insets.bottom},
          contentContainerStyle,
        ]}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    ...V2_SHADOWS.raised,
  },
  background: {
    backgroundColor: V2_COLORS.background.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    paddingBottom: 4,
    paddingTop: 12,
  },
  handleIndicator: {
    backgroundColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.pill,
    height: 4,
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: V2_SPACING.xl,
  },
});
