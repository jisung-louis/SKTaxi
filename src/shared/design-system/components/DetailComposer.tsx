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
} from '../tokens';

interface DetailComposerProps {
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

export const DetailComposer = React.forwardRef<TextInput, DetailComposerProps>(
  (
    {
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
    },
    ref,
  ) => {
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
      <View style={[styles.container, {paddingBottom: insets.bottom}]}>
        <View style={styles.row}>
          {leadingIconName && onPressLeadingAction ? (
            <TouchableOpacity
              accessibilityLabel={leadingActionAccessibilityLabel}
              accessibilityRole="button"
              activeOpacity={0.82}
              onPress={onPressLeadingAction}
              style={styles.leadingButton}>
              <Icon
                color={COLORS.text.muted}
                name={leadingIconName}
                size={18}
              />
            </TouchableOpacity>
          ) : null}

          <View style={styles.inputSurface}>
            <TextInput
              ref={ref}
              editable={editable}
              onChangeText={handleChangeText}
              placeholder={placeholder}
              placeholderTextColor={COLORS.text.muted}
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
              color={isSendEnabled ? COLORS.text.inverse : COLORS.text.muted}
              name="paper-plane-outline"
              size={18}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

DetailComposer.displayName = 'DetailComposer';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.surface,
    borderTopColor: COLORS.border.subtle,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 13,
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  leadingButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  inputSurface: {
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.lg,
    flex: 1,
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
  },
  input: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
    lineHeight: 18,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: COLORS.border.default,
    borderRadius: RADIUS.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sendButtonActive: {
    backgroundColor: COLORS.brand.primary,
  },
});
