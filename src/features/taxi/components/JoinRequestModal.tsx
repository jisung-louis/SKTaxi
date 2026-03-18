import React, {useEffect} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
  V2_TYPOGRAPHY,
} from '@/shared/design-system/tokens';

type Props = {
  visible: boolean;
  requesterName: string;
  onAccept: () => void | Promise<void>;
  onDecline: () => void | Promise<void>;
  onRequestClose: () => void;
};

const ANIMATION_DURATION = 220;

export const JoinRequestModal: React.FC<Props> = ({
  visible,
  requesterName,
  onAccept,
  onDecline,
  onRequestClose,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: ANIMATION_DURATION,
    });
  }, [progress, visible]);

  const handleAction = React.useCallback(
    (callback: () => void | Promise<void>) => {
      progress.value = withTiming(0, {
        duration: ANIMATION_DURATION,
      });

      setTimeout(() => {
        Promise.resolve(callback()).catch(() => undefined);
      }, ANIMATION_DURATION);
    },
    [progress],
  );

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [
      {translateY: interpolate(progress.value, [0, 1], [20, 0])},
      {scale: interpolate(progress.value, [0, 1], [0.96, 1])},
    ],
  }));

  return (
    <Modal
      animationType="none"
      onRequestClose={onRequestClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>새 동승 요청</Text>
            </View>

            <View style={styles.heroIcon}>
              <Icon
                color={V2_COLORS.brand.primaryStrong}
                name="person-add-outline"
                size={26}
              />
            </View>

            <Text style={styles.title}>동승 요청이 도착했어요</Text>
            <Text style={styles.description}>
              <Text style={styles.requesterName}>{requesterName}</Text>
              님이 현재 파티에 참여하고 싶어 해요.
            </Text>
            <Text style={styles.caption}>
              요청을 수락하면 파티원으로 즉시 합류됩니다.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionGroup}>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.88}
              onPress={() => {
                handleAction(onDecline);
              }}
              style={styles.secondaryButton}>
              <Icon
                color={V2_COLORS.text.secondary}
                name="close-outline"
                size={18}
              />
              <Text style={styles.secondaryButtonLabel}>거절</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.9}
              onPress={() => {
                handleAction(onAccept);
              }}
              style={styles.primaryButton}>
              <Icon
                color={V2_COLORS.text.inverse}
                name="checkmark-outline"
                size={18}
              />
              <Text style={styles.primaryButtonLabel}>수락</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actionGroup: {
    flexDirection: 'row',
    gap: V2_SPACING.md,
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.44)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.xxl,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderColor: V2_COLORS.border.accent,
    borderRadius: V2_RADIUS.pill,
    borderWidth: 1,
    marginBottom: V2_SPACING.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeLabel: {
    ...V2_TYPOGRAPHY.caption1,
    color: V2_COLORS.brand.primaryStrong,
    fontWeight: '700',
  },
  caption: {
    ...V2_TYPOGRAPHY.caption1,
    color: V2_COLORS.text.tertiary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 360,
    padding: V2_SPACING.xxl,
    width: '100%',
    ...V2_SHADOWS.raised,
  },
  description: {
    ...V2_TYPOGRAPHY.body1,
    color: V2_COLORS.text.secondary,
    marginBottom: V2_SPACING.sm,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: V2_COLORS.border.subtle,
    height: 1,
    marginBottom: V2_SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: V2_SPACING.lg,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primarySoft,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: V2_SPACING.md,
    width: 56,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.md,
    flex: 1,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    height: 52,
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    ...V2_TYPOGRAPHY.body1,
    color: V2_COLORS.text.inverse,
    fontWeight: '700',
  },
  requesterName: {
    color: V2_COLORS.text.primary,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    height: 52,
    justifyContent: 'center',
  },
  secondaryButtonLabel: {
    ...V2_TYPOGRAPHY.body1,
    color: V2_COLORS.text.secondary,
    fontWeight: '600',
  },
  title: {
    ...V2_TYPOGRAPHY.title2,
    color: V2_COLORS.text.primary,
    marginBottom: V2_SPACING.sm,
    textAlign: 'center',
  },
});
