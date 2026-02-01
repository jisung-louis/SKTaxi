import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import Button from '../../../components/common/Button';

interface ChatInputProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSend: () => void;
  onPlusPress: () => void;
  onInputFocus: () => void;
  showMenu: boolean;
  isPartyEnded: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  onMessageChange,
  onSend,
  onPlusPress,
  onInputFocus,
  showMenu,
  isPartyEnded,
}) => {
  return (
    <View style={styles.inputContainer}>
      {!isPartyEnded && (
        <TouchableOpacity style={styles.plusButton} onPress={onPlusPress}>
          {showMenu ? (
            <Icon name="close-outline" size={24} color={COLORS.text.primary} />
          ) : (
            <Icon name="add" size={24} color={COLORS.text.primary} />
          )}
        </TouchableOpacity>
      )}
      <TextInput
        style={[styles.input, isPartyEnded && styles.disabledInput]}
        value={message}
        onChangeText={onMessageChange}
        placeholder={isPartyEnded ? "동승이 종료된 채팅방입니다" : "메시지를 입력하세요"}
        placeholderTextColor={COLORS.text.disabled}
        multiline
        editable={!isPartyEnded}
        onFocus={onInputFocus}
      />
      <Button
        title="전송"
        onPress={onSend}
        disabled={isPartyEnded}
        style={{
          height: 40,
          borderRadius: 16,
          opacity: isPartyEnded ? 0.5 : 1
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    gap: 8,
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.background.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  disabledInput: {
    backgroundColor: COLORS.background.surface,
    opacity: 0.5,
  },
});
