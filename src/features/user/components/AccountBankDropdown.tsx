import React from 'react';
import {StyleSheet, View} from 'react-native';

import {SelectionDropdown} from '@/shared/design-system/components';

interface AccountBankDropdownProps {
  bankNames: string[];
  isOpen: boolean;
  onPressSelect: (bankName: string) => void;
  onRequestClose: () => void;
  onPressTrigger: () => void;
  selectedBankName: string;
}

export const AccountBankDropdown = ({
  bankNames,
  isOpen,
  onPressSelect,
  onRequestClose,
  onPressTrigger,
  selectedBankName,
}: AccountBankDropdownProps) => {
  return (
    <View style={styles.wrapper}>
      <SelectionDropdown
        isOpen={isOpen}
        onPressSelect={onPressSelect}
        onRequestClose={onRequestClose}
        onPressTrigger={onPressTrigger}
        options={bankNames}
        selectedValue={selectedBankName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 50,
  },
});
