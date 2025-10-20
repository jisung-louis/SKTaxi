import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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
  onSubmit: (content: string, isAnonymous?: boolean) => Promise<void>;
  submitting?: boolean;
  placeholder?: string;
  parentId?: string;
  onKeyboardHeightChange?: (height: number) => void;
  onCancelReply?: () => void;
}

export interface CommentInputRef {
  focus: () => void;
}

const CommentInput = forwardRef<CommentInputRef, CommentInputProps>(({
  onSubmit,
  submitting = false,
  placeholder = '댓글을 입력하세요...',
  parentId,
  onKeyboardHeightChange,
  onCancelReply
}, ref) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true); // 기본값 true
  const translateY = useSharedValue(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const textInputRef = useRef<TextInput>(null);

  // ref를 통한 focus 메서드 노출
  useImperativeHandle(ref, () => ({
    focus: () => {
      textInputRef.current?.focus();
    }
  }));

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
        
        // 답글 모드일 때 키보드가 내려가면 답글 모드 해제
        if (parentId && onCancelReply) {
          onCancelReply();
        }
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
      await onSubmit(content.trim(), isAnonymous);
      setContent('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const toggleAnonymous = () => {
    setIsAnonymous(prev => !prev);
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
      {/* 익명 토글 */}
      <View style={styles.inputRow}>
        <TouchableOpacity 
          style={styles.anonymousToggle}
          onPress={toggleAnonymous}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            isAnonymous && styles.checkboxChecked
          ]}>
            {isAnonymous && (
              <Icon 
                name="checkmark" 
                size={12} 
                color={COLORS.text.white} 
              />
            )}
          </View>
          <Text style={[
            styles.anonymousLabel,
            isAnonymous && styles.anonymousLabelChecked
          ]}>
            익명
          </Text>
        </TouchableOpacity>
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.disabled}
          multiline={false}
          maxLength={500}
          editable={!submitting}
          onBlur={() => {
            if (parentId && onCancelReply) {
              onCancelReply();
            }
          }}
        />
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
      <Text style={styles.characterCount}>
        {content.length}/500
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    bottom: -30, //For KeyboardShow
    left: 0,
    right: 0,
    height: 90 + 1 + 20 + 20, // 90: containerHeight, 1: inputContainerBorderHeight, 20: PaddingBottom, 20: For KeyboardShow
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 12,
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    height: 44,
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
    height: 36,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: COLORS.border.primary,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent.blue,
    borderColor: COLORS.accent.blue,
  },
  anonymousLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  anonymousLabelChecked: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
});

CommentInput.displayName = 'CommentInput';

export default CommentInput;
