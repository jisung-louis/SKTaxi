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

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '../tokens';

interface V2SelectionDropdownProps {
  isOpen: boolean;
  maxHeight?: number;
  onPressSelect: (value: string) => void;
  onPressTrigger: () => void;
  options: string[];
  placeholder?: string;
  selectedValue?: string;
  style?: StyleProp<ViewStyle>;
}

export const V2SelectionDropdown = ({
  isOpen,
  maxHeight = 208,
  onPressSelect,
  onPressTrigger,
  options,
  placeholder = '',
  selectedValue,
  style,
}: V2SelectionDropdownProps) => {
  const triggerLabel = selectedValue || placeholder;

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
        <Icon
          color={V2_COLORS.text.muted}
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
        />
      </TouchableOpacity>

      {isOpen ? (
        <View style={[styles.dropdown, {maxHeight}]}>
          <ScrollView bounces={false} nestedScrollEnabled style={{maxHeight}}>
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
                      color={V2_COLORS.brand.primary}
                      name="checkmark"
                      size={16}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
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
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: 17,
  },
  triggerLabel: {
    color: V2_COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  triggerPlaceholderLabel: {
    color: V2_COLORS.text.muted,
  },
  dropdown: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 58,
    ...V2_SHADOWS.raised,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
    paddingHorizontal: V2_SPACING.lg,
  },
  optionSelected: {
    backgroundColor: V2_COLORS.brand.primaryTint,
  },
  optionLabel: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    lineHeight: 20,
  },
  optionLabelSelected: {
    color: V2_COLORS.brand.primaryStrong,
    fontWeight: '600',
  },
});
