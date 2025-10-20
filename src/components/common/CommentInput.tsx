import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Keyboard,
  Platform
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
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
  onKeyboardHeightChange?: (height: number) => void;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  submitting = false,
  placeholder = '댓글을 입력하세요...',
  parentId,
  onCancel,
  showCancel = false,
  onKeyboardHeightChange
}) => {
  const [content, setContent] = useState('');
  const translateY = useSharedValue(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 키보드 이벤트 처리
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);
        onKeyboardHeightChange?.(keyboardHeight);
        translateY.value = withTiming(-keyboardHeight + 20, {
          duration: Platform.OS === 'ios' ? event.duration || 250 : 250,
        });
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event) => {
        setKeyboardHeight(0);
        onKeyboardHeightChange?.(0);
        translateY.value = withTiming(0, {
          duration: Platform.OS === 'ios' ? event.duration || 250 : 250,
        });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [translateY]);

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

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]}
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
                color={(!content.trim() || submitting) ? COLORS.accent.green : COLORS.text.white} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.characterCount}>
        {content.length}/500
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    bottom: -20, //For KeyboardShow
    left: 0,
    right: 0,
    height: 90 + 1 + 20 + 20, // 90: containerHeight, 1: inputContainerBorderHeight, 20: PaddingBottom, 20: For KeyboardShow
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
    outlineWidth: 1,
    outlineColor: COLORS.accent.green,
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
