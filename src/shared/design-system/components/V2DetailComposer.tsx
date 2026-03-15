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
import {useKeyboardInset} from '@/shared/hooks';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SPACING,
} from '../tokens';

interface V2DetailComposerProps {
  editable?: boolean;
  leadingActionAccessibilityLabel?: string;
  leadingIconName?: string;
  onChangeText?: (value: string) => void;
  onPressLeadingAction?: () => void;
  onSend?: (value: string) => void;
  placeholder: string;
  sendAccessibilityLabel?: string;
  sendEnabled?: boolean;
  textInputProps?: TextInputProps;
  value?: string;
}

export const V2DetailComposer = ({
  editable = true,
  leadingActionAccessibilityLabel = '첨부',
  leadingIconName,
  onChangeText,
  onPressLeadingAction,
  onSend,
  placeholder,
  sendAccessibilityLabel = '전송',
  sendEnabled,
  textInputProps,
  value,
}: V2DetailComposerProps) => {
  const insets = useSafeAreaInsets();
  const [internalValue, setInternalValue] = React.useState('');
  const resolvedValue = value ?? internalValue;
  const isSendEnabled =
    sendEnabled ?? (editable && resolvedValue.trim().length > 0);

  const handleChangeText = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }

      onChangeText?.(nextValue);
    },
    [onChangeText, value],
  );

  const handleSend = React.useCallback(() => {
    const trimmedValue = resolvedValue.trim();

    if (!trimmedValue || !isSendEnabled) {
      return;
    }

    onSend?.(trimmedValue);

    if (value === undefined) {
      setInternalValue('');
    }
  }, [isSendEnabled, onSend, resolvedValue, value]);

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: insets.bottom}
      ]}>
      <View style={styles.row}>
        {leadingIconName && onPressLeadingAction ? (
          <TouchableOpacity
            accessibilityLabel={leadingActionAccessibilityLabel}
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={onPressLeadingAction}
            style={styles.leadingButton}>
            <Icon
              color={V2_COLORS.text.muted}
              name={leadingIconName}
              size={18}
            />
          </TouchableOpacity>
        ) : null}

        <View style={styles.inputSurface}>
          <TextInput
            editable={editable}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor={V2_COLORS.text.muted}
            style={styles.input}
            textAlignVertical="center"
            value={resolvedValue}
            {...textInputProps}
          />
        </View>

        <TouchableOpacity
          accessibilityLabel={sendAccessibilityLabel}
          accessibilityRole="button"
          activeOpacity={isSendEnabled ? 0.82 : 1}
          disabled={!isSendEnabled}
          onPress={handleSend}
          style={[
            styles.sendButton,
            isSendEnabled ? styles.sendButtonActive : null,
          ]}>
          <Icon
            color={
              isSendEnabled ? V2_COLORS.text.inverse : V2_COLORS.text.muted
            }
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
    backgroundColor: V2_COLORS.background.surface,
    borderTopColor: V2_COLORS.border.subtle,
    borderTopWidth: 1,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: 13,
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  leadingButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  inputSurface: {
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.lg,
    flex: 1,
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: 10,
  },
  input: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 23,
    padding: 0,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sendButtonActive: {
    backgroundColor: V2_COLORS.brand.primary,
  },
});
