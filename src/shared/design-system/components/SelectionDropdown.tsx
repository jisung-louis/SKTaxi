import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '../tokens';

interface SelectionDropdownProps {
  isOpen: boolean;
  maxHeight?: number;
  onPressSelect: (value: string) => void;
  onPressTrigger: () => void;
  options: string[];
  placeholder?: string;
  selectedValue?: string;
  style?: StyleProp<ViewStyle>;
}

export const SelectionDropdown = ({
  isOpen,
  maxHeight = 208,
  onPressSelect,
  onPressTrigger,
  options,
  placeholder = '',
  selectedValue,
  style,
}: SelectionDropdownProps) => {
  const triggerLabel = selectedValue || placeholder;
  const progress = useSharedValue(isOpen ? 1 : 0);
  const dropdownHeight = Math.min(options.length * 44, maxHeight);

  React.useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, {
      duration: 220,
    });
  }, [isOpen, progress]);

  const dropdownAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, dropdownHeight]),
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [-8, 0]),
      },
    ],
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  return (
    <View style={[styles.wrapper, isOpen ? styles.wrapperRaised : undefined, style]}>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.82}
        onPress={onPressTrigger}
        style={styles.trigger}>
        <Text
          style={[
            styles.triggerLabel,
            !selectedValue ? styles.triggerPlaceholderLabel : undefined,
          ]}>
          {triggerLabel}
        </Text>
        <Animated.View style={chevronAnimatedStyle}>
          <Icon
            color={COLORS.text.muted}
            name="chevron-down"
            size={16}
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.dropdown, dropdownAnimatedStyle]}>
          <ScrollView bounces={false} nestedScrollEnabled style={{maxHeight: dropdownHeight}}>
            {options.map(option => {
              const isSelected = option === selectedValue;

              return (
                <TouchableOpacity
                  key={option}
                  accessibilityRole="button"
                  activeOpacity={0.82}
                  onPress={() => onPressSelect(option)}
                  style={[
                    styles.option,
                    isSelected ? styles.optionSelected : undefined,
                  ]}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected ? styles.optionLabelSelected : undefined,
                    ]}>
                    {option}
                  </Text>

                  {isSelected ? (
                    <Icon
                      color={COLORS.brand.primary}
                      name="checkmark"
                      size={16}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 50,
    position: 'relative',
  },
  wrapperRaised: {
    zIndex: 20,
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: 17,
  },
  triggerLabel: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  triggerPlaceholderLabel: {
    color: COLORS.text.muted,
  },
  dropdown: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 58,
    ...SHADOWS.raised,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  optionSelected: {
    backgroundColor: COLORS.brand.primaryTint,
  },
  optionLabel: {
    color: COLORS.text.strong,
    fontSize: 14,
    lineHeight: 20,
  },
  optionLabelSelected: {
    color: COLORS.brand.primaryStrong,
    fontWeight: '600',
  },
});
