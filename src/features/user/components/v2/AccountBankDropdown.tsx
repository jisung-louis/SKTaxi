import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface AccountBankDropdownProps {
  bankNames: string[];
  isOpen: boolean;
  onPressSelect: (bankName: string) => void;
  onPressTrigger: () => void;
  selectedBankName: string;
}

export const AccountBankDropdown = ({
  bankNames,
  isOpen,
  onPressSelect,
  onPressTrigger,
  selectedBankName,
}: AccountBankDropdownProps) => {
  return (
    <View style={[styles.wrapper, isOpen ? styles.wrapperRaised : undefined]}>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.82}
        onPress={onPressTrigger}
        style={styles.trigger}>
        <Text style={styles.triggerLabel}>{selectedBankName}</Text>
        <Icon
          color={V2_COLORS.text.muted}
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
        />
      </TouchableOpacity>

      {isOpen ? (
        <View style={styles.dropdown}>
          <ScrollView bounces={false} nestedScrollEnabled style={styles.scroll}>
            {bankNames.map(bankName => {
              const isSelected = bankName === selectedBankName;
              return (
                <TouchableOpacity
                  key={bankName}
                  accessibilityRole="button"
                  activeOpacity={0.82}
                  onPress={() => onPressSelect(bankName)}
                  style={[
                    styles.option,
                    isSelected ? styles.optionSelected : undefined,
                  ]}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected ? styles.optionLabelSelected : undefined,
                    ]}>
                    {bankName}
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
    fontSize: 14,
    lineHeight: 20,
  },
  dropdown: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    left: 0,
    maxHeight: 208,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 58,
    ...V2_SHADOWS.raised,
  },
  scroll: {
    maxHeight: 208,
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
