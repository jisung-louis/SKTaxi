import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

interface ChatComposerBarProps {
  imageButtonAccessibilityLabel?: string
  imageButtonDisabled?: boolean
  keyboardVisible?: boolean
  leadingAccessory?: React.ReactNode
  onChangeText: (value: string) => void
  onPressImage?: () => void
  onSend: (value: string) => void
  placeholder: string
  sendAccessibilityLabel?: string
  sendDisabled?: boolean
  textInputProps?: TextInputProps
  value: string
}

export const CHAT_COMPOSER_ROW_BASE_HEIGHT = 49;

export const ChatComposerBar = ({
  imageButtonAccessibilityLabel = '이미지 보내기',
  imageButtonDisabled = false,
  keyboardVisible = false,
  leadingAccessory,
  onChangeText,
  onPressImage,
  onSend,
  placeholder,
  sendAccessibilityLabel = '메시지 전송',
  sendDisabled = false,
  textInputProps,
  value,
}: ChatComposerBarProps) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = keyboardVisible ? 10 : Math.max(insets.bottom, 10);
  const sendEnabled = !sendDisabled && value.trim().length > 0;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.row,
          {
            paddingBottom: bottomPadding,
          },
        ]}>
        {leadingAccessory}

        {onPressImage ? (
          <TouchableOpacity
            accessibilityLabel={imageButtonAccessibilityLabel}
            accessibilityRole="button"
            activeOpacity={imageButtonDisabled ? 1 : 0.82}
            disabled={imageButtonDisabled}
            onPress={onPressImage}
            style={styles.imageButton}>
            <Icon color={COLORS.text.muted} name="image-outline" size={18} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.inputSurface}>
          <TextInput
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.text.muted}
            style={styles.input}
            value={value}
            {...textInputProps}
          />
        </View>

        <TouchableOpacity
          accessibilityLabel={sendAccessibilityLabel}
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
  container: {
    backgroundColor: COLORS.background.surface,
    borderTopColor: COLORS.border.subtle,
    borderTopWidth: 1,
  },
  imageButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  input: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    padding: 0,
  },
  inputSurface: {
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.lg,
    flex: 1,
    height: 39,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    minHeight: 60,
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    zIndex: 2,
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
});
