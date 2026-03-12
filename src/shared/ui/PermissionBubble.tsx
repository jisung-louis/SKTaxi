import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';

import { COLORS } from '@/shared/constants/colors';
import { BOTTOM_TAB_BAR_HEIGHT } from '@/shared/constants/layout';
import { TYPOGRAPHY } from '@/shared/constants/typography';

type PermissionBubbleProps = {
  visible: boolean;
  onAllowNotification: () => void;
  onClose: () => void;
};

export const PermissionBubble = ({
  visible,
  onAllowNotification,
  onClose,
}: PermissionBubbleProps) => {
  const fade = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.95)).current;
  const [rendered, setRendered] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (rendered) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.98,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => setRendered(false));
    }
  }, [visible, rendered, fade, scale]);

  if (!rendered) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, { opacity: fade, transform: [{ scale }] }]}
      pointerEvents="box-none"
    >
      <View style={styles.bubble}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="close" size={16} color={COLORS.background.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>알림 허용이 꺼져있어요</Text>
        <Text style={styles.desc}>
          원활한 택시 동승/공지 알림을 위해 알림을 허용해 주세요!
        </Text>
        <TouchableOpacity style={styles.cta} onPress={onAllowNotification}>
          <Text style={styles.ctaText}>알림 허용하기</Text>
        </TouchableOpacity>
        <View style={styles.tail} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 16 + BOTTOM_TAB_BAR_HEIGHT,
    zIndex: 10000,
    elevation: 10000,
  },
  bubble: {
    maxWidth: WINDOW_WIDTH * 0.6,
    backgroundColor: COLORS.accent.green,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    backgroundColor: COLORS.accent.green,
  },
  title: {
    ...TYPOGRAPHY.body2,
    color: COLORS.background.primary,
    fontWeight: 'bold',
    marginRight: 20,
    marginBottom: 6,
  },
  desc: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.background.primary,
    opacity: 0.95,
    marginBottom: 10,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ctaText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  tail: {
    position: 'absolute',
    bottom: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.accent.green,
  },
});

export default PermissionBubble;
