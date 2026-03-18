import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from '@/shared/design-system/tokens';

interface ForegroundNotificationProps {
  visible: boolean;
  title: string;
  body: string;
  onPress: () => void;
  onDismiss: () => void;
}

export const ForegroundNotification: React.FC<ForegroundNotificationProps> = React.memo(({
  visible,
  title,
  body,
  onPress,
  onDismiss,
}) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacityAnim] = useState(new Animated.Value(0));

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [onDismiss, opacityAnim, slideAnim]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 5초 후 자동 숨김
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [handleDismiss, opacityAnim, slideAnim, visible]);
  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.notification}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Icon
            name="notifications"
            size={24}
            color={COLORS.brand.primary}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  notification: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.raised,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.brand.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});
