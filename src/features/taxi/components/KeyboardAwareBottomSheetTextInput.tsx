import React from 'react';
import {useBottomSheetInternal} from '@gorhom/bottom-sheet';
import {
  type NativeSyntheticEvent,
  TextInput,
  type TextInputFocusEventData,
  type TextInputProps,
} from 'react-native';

export const KeyboardAwareBottomSheetTextInput = React.forwardRef<
  TextInput,
  TextInputProps
>(({onBlur, onFocus, ...rest}, ref) => {
  const {shouldHandleKeyboardEvents} = useBottomSheetInternal();

  const handleFocus = React.useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = true;
      onFocus?.(event);
    },
    [onFocus, shouldHandleKeyboardEvents],
  );

  const handleBlur = React.useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = false;
      onBlur?.(event);
    },
    [onBlur, shouldHandleKeyboardEvents],
  );

  React.useEffect(() => {
    return () => {
      shouldHandleKeyboardEvents.value = false;
    };
  }, [shouldHandleKeyboardEvents]);

  return (
    <TextInput
      {...rest}
      onBlur={handleBlur}
      onFocus={handleFocus}
      ref={ref}
    />
  );
});

KeyboardAwareBottomSheetTextInput.displayName =
  'KeyboardAwareBottomSheetTextInput';
