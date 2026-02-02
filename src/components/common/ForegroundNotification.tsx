import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import Icon from 'react-native-vector-icons/Ionicons';

interface ForegroundNotificationProps {
  visible: boolean;
  title: string;
  body: string;
  onPress: () => void;
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

export const ForegroundNotification: React.FC<ForegroundNotificationProps> = ({
  visible,
  title,
  body,
  onPress,
  onDismiss
}) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // console.log('🔔 ForegroundNotification useEffect:', { visible, title, body });
    
    if (visible) {
      console.log('🔔 알림 표시 애니메이션 시작');
      // 알림 표시 애니메이션
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
        console.log('🔔 5초 후 자동 숨김');
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      console.log('🔔 알림 숨김');
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
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
  };

  console.log('🔔 ForegroundNotification render:', { visible, title, body });
  
  if (!visible) {
    // console.log('🔔 ForegroundNotification: visible=false, 렌더링하지 않음');
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
          <Icon name="notifications" size={24} color={COLORS.accent.green} />
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
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  notification: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent.green + '15',
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
