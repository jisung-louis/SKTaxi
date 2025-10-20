import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  submitting?: boolean;
  placeholder?: string;
  parentId?: string;
  onCancel?: () => void;
  showCancel?: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  submitting = false,
  placeholder = '댓글을 입력하세요...',
  parentId,
  onCancel,
  showCancel = false
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleCancel = () => {
    setContent('');
    onCancel?.();
  };

  const isReply = !!parentId;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.inputContainer, isReply && styles.replyContainer]}>
        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.disabled}
          multiline
          maxLength={500}
          editable={!submitting}
        />
        <View style={styles.actions}>
          {showCancel && (
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
              disabled={submitting}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              (!content.trim() || submitting) && styles.submitButtonDisabled
            ]}
            disabled={!content.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.accent.green} />
            ) : (
              <Icon 
                name={isReply ? "return-up-forward" : "send"} 
                size={16} 
                color={COLORS.accent.green} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.characterCount}>
        {content.length}/500
      </Text>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  replyContainer: {
    marginLeft: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent.green,
  },
  textInput: {
    flex: 1,
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    maxHeight: 100,
    paddingVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  submitButton: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border.default,
  },
  characterCount: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.disabled,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default CommentInput;
