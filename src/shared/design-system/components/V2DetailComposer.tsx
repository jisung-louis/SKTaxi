import React from 'react';
import {
  StyleSheet,
  TextInput,
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
  placeholder: string;
}

export const V2DetailComposer = ({
  placeholder,
}: V2DetailComposerProps) => {
  const insets = useSafeAreaInsets();
  const {isVisible: isKeyboardVisible} = useKeyboardInset();
  const [value, setValue] = React.useState('');
  const isSendEnabled = value.trim().length > 0;

  return (
    <View
      style={[
        styles.container,
        isKeyboardVisible ? {paddingBottom: insets.bottom} : null,
      ]}>
      <View style={styles.row}>
        <View style={styles.inputSurface}>
          <TextInput
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={V2_COLORS.text.muted}
            style={styles.input}
            textAlignVertical="center"
            value={value}
          />
        </View>

        <TouchableOpacity
          accessibilityLabel="댓글 전송"
          accessibilityRole="button"
          activeOpacity={isSendEnabled ? 0.82 : 1}
          disabled={!isSendEnabled}
          onPress={() => undefined}
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
