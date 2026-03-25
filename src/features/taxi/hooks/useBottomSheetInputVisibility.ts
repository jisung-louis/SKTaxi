import React from 'react';
import type {BottomSheetScrollViewMethods} from '@gorhom/bottom-sheet';
import {
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  TextInput,
  useWindowDimensions,
} from 'react-native';

import {useKeyboardInset} from '@/shared/hooks';

const INPUT_REVEAL_MARGIN = 20;

export const useBottomSheetInputVisibility = (visible: boolean) => {
  const {height: keyboardHeight, isVisible: keyboardVisible} = useKeyboardInset();
  const {height: windowHeight} = useWindowDimensions();
  const scrollRef = React.useRef<BottomSheetScrollViewMethods | null>(null);
  const focusedInputRef = React.useRef<TextInput | null>(null);
  const scrollOffsetRef = React.useRef(0);

  const revealFocusedInput = React.useCallback(() => {
    const focusedInput = focusedInputRef.current;

    if (!focusedInput || keyboardHeight <= 0) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        focusedInput.measureInWindow((_x, y, _width, height) => {
          const keyboardTop = windowHeight - keyboardHeight;
          const overlap = y + height + INPUT_REVEAL_MARGIN - keyboardTop;

          if (overlap <= 0) {
            return;
          }

          const nextScrollOffset = scrollOffsetRef.current + overlap;
          scrollRef.current?.scrollTo({
            animated: true,
            y: nextScrollOffset,
          });
          scrollOffsetRef.current = nextScrollOffset;
        });
      });
    });
  }, [keyboardHeight, windowHeight]);

  React.useEffect(() => {
    if (!keyboardVisible) {
      return;
    }

    revealFocusedInput();
  }, [keyboardVisible, revealFocusedInput]);

  React.useEffect(() => {
    if (!visible) {
      focusedInputRef.current = null;
      scrollOffsetRef.current = 0;
      return;
    }

    scrollRef.current?.scrollTo({
      animated: false,
      y: 0,
    });
    scrollOffsetRef.current = 0;
  }, [visible]);

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  const createFocusHandler = React.useCallback(
    (inputRef: React.RefObject<TextInput | null>) => () => {
      focusedInputRef.current = inputRef.current;

      if (keyboardVisible) {
        revealFocusedInput();
      }
    },
    [keyboardVisible, revealFocusedInput],
  );

  const handleBlur = React.useCallback(() => {
    focusedInputRef.current = null;
  }, []);

  return {
    createFocusHandler,
    handleBlur,
    handleScroll,
    scrollRef,
  };
};
