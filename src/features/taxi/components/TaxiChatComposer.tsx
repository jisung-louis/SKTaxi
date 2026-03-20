import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {
  TaxiChatActionTrayActionId,
  TaxiChatActionTrayActionViewData,
} from '../model/taxiChatViewData';

interface TaxiChatComposerProps {
  actionTrayActions: TaxiChatActionTrayActionViewData[];
  actionTrayVisible: boolean;
  onChangeText: (value: string) => void;
  onPressAction: (actionId: TaxiChatActionTrayActionId) => void;
  onPressToggleTray: () => void;
  onSend: (value: string) => void;
  placeholder: string;
  value: string;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const getActionIconName = (actionId: TaxiChatActionTrayActionId) => {
  switch (actionId) {
    case 'callTaxi':
      return 'car-sport-outline';
    case 'sendAccount':
      return 'card-outline';
    case 'close':
      return 'pause-circle-outline';
    case 'reopen':
      return 'play-circle-outline';
    case 'arrive':
      return 'location-outline';
    case 'settlementStatus':
      return 'wallet-outline';
    case 'end':
      return 'close-circle-outline';
    default:
      return 'ellipse-outline';
  }
};

const getActionToneStyle = (
  tone: TaxiChatActionTrayActionViewData['tone'],
) => {
  switch (tone) {
    case 'info':
      return {
        backgroundColor: COLORS.accent.blueSoft,
        iconColor: COLORS.accent.blue,
      };
    case 'warning':
      return {
        backgroundColor: COLORS.accent.orangeSoft,
        iconColor: COLORS.status.warning,
      };
    case 'danger':
      return {
        backgroundColor: '#FEE2E2',
        iconColor: COLORS.status.danger,
      };
    case 'purple':
      return {
        backgroundColor: COLORS.accent.purpleSoft,
        iconColor: COLORS.accent.purple,
      };
    case 'brand':
    default:
      return {
        backgroundColor: COLORS.brand.primaryTint,
        iconColor: COLORS.brand.primaryStrong,
      };
  }
};

export const TaxiChatComposer = ({
  actionTrayActions,
  actionTrayVisible,
  onChangeText,
  onPressAction,
  onPressToggleTray,
  onSend,
  placeholder,
  value,
}: TaxiChatComposerProps) => {
  const insets = useSafeAreaInsets();
  const hasTrayActions = actionTrayActions.length > 0;
  const trayProgress = useSharedValue(actionTrayVisible ? 1 : 0);

  React.useEffect(() => {
    trayProgress.value = withTiming(actionTrayVisible ? 1 : 0, {duration: 180});
  }, [actionTrayVisible, trayProgress]);

  const toggleButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      trayProgress.value,
      [0, 1],
      [COLORS.brand.primary, COLORS.text.primary],
    ),
  }));

  const toggleIconStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${interpolate(trayProgress.value, [0, 1], [0, 45])}deg`}],
  }));

  const trayStyle = useAnimatedStyle(() => ({
    opacity: trayProgress.value,
    transform: [{translateY: interpolate(trayProgress.value, [0, 1], [24, 0])}],
  }));

  const sendEnabled = value.trim().length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
        },
      ]}>
      {hasTrayActions ? (
        <Animated.View
          pointerEvents={actionTrayVisible ? 'auto' : 'none'}
          style={[styles.tray, trayStyle]}>
          <View style={styles.trayGrid}>
            {actionTrayActions.map(action => {
              const toneStyle = getActionToneStyle(action.tone);

              return (
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.84}
                  key={action.id}
                  onPress={() => onPressAction(action.id)}
                  style={styles.trayAction}>
                  <View
                    style={[
                      styles.trayActionIconWrap,
                      {backgroundColor: toneStyle.backgroundColor},
                    ]}>
                    <Icon
                      color={toneStyle.iconColor}
                      name={getActionIconName(action.id)}
                      size={18}
                    />
                  </View>
                  <Text style={styles.trayActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      ) : null}

      <View style={styles.row}>
        {hasTrayActions ? (
          <AnimatedTouchableOpacity
            accessibilityLabel="액션 메뉴 열기"
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={onPressToggleTray}
            style={[styles.leadingButton, toggleButtonStyle]}>
            <Animated.View style={toggleIconStyle}>
              <Icon color={COLORS.text.inverse} name="add" size={20} />
            </Animated.View>
          </AnimatedTouchableOpacity>
        ) : null}

        <View style={styles.attachmentButton}>
          <Icon color={COLORS.text.muted} name="image-outline" size={18} />
        </View>

        <View style={styles.inputSurface}>
          <TextInput
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.text.muted}
            style={styles.input}
            value={value}
          />
        </View>

        <TouchableOpacity
          accessibilityLabel="메시지 전송"
          accessibilityRole="button"
          activeOpacity={sendEnabled ? 0.82 : 1}
          disabled={!sendEnabled}
          onPress={() => {
            const trimmed = value.trim();

            if (!trimmed) {
              return;
            }

            onSend(trimmed);
          }}
          style={[
            styles.sendButton,
            sendEnabled ? styles.sendButtonEnabled : styles.sendButtonDisabled,
          ]}>
          <Icon
            color={sendEnabled ? COLORS.text.inverse : COLORS.text.muted}
            name="paper-plane-outline"
            size={18}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  attachmentButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  container: {
    backgroundColor: COLORS.background.surface,
    borderTopColor: COLORS.border.subtle,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
  },
  input: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    padding: 0,
  },
  inputSurface: {
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.lg,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  leadingButton: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border.default,
  },
  sendButtonEnabled: {
    backgroundColor: COLORS.brand.primary,
  },
  tray: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    ...SHADOWS.raised,
  },
  trayAction: {
    alignItems: 'center',
    flexBasis: '50%',
    gap: SPACING.sm,
  },
  trayActionIconWrap: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  trayActionLabel: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  trayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
    rowGap: SPACING.lg,
  },
});
