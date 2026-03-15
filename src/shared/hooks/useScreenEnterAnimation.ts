import React from 'react';
import {useIsFocused} from '@react-navigation/native';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const useScreenEnterAnimation = () => {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  React.useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, {duration: 200});
    translateY.value = withTiming(isFocused ? 0 : 10, {duration: 200});
  }, [isFocused, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));
};
