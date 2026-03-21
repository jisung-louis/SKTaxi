import React from 'react';
import {
  Animated,
  Dimensions,
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
  const [isMounted, setIsMounted] = React.useState(visible);
  const animationProgress = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
  const overlayOpacity = animationProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const sheetTranslateY = animationProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get('window').height, 0],
  });

  React.useEffect(() => {
    if (visible) {
      setIsMounted(true);
    }
  }, [visible]);

  React.useEffect(() => {
    if (!isMounted) {
      return;
    }

    const animation = Animated.timing(animationProgress, {
      duration: 220,
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    });

    animation.start(({finished}) => {
      if (finished && !visible) {
        setIsMounted(false);
      }
    });

    return () => {
      animation.stop();
    };
  }, [animationProgress, isMounted, visible]);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      transparent
      visible={isMounted}>
      <View style={styles.overlayWrap}>
        <Animated.View
          pointerEvents="none"
          style={[styles.overlayBackdrop, {opacity: overlayOpacity}]}
        />
        <Pressable
          onPress={onClose}
          pointerEvents={visible ? 'auto' : 'none'}
          style={styles.overlay}
        />

        <Animated.View
          style={[
            styles.sheet,
            contentStyle,
            {transform: [{translateY: sheetTranslateY}]},
          ]}>
          {children}
        </Animated.View>
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
