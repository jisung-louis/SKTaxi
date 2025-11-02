import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';

interface DropdownProps {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  modalTitle?: string;
  style?: any;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onSelect,
  placeholder = '선택해주세요',
  modalTitle,
  style,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
  };

  const displayText = value || placeholder;
  const isPlaceholder = !value;

  const renderOption = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        value === item && styles.selectedOption,
        { borderBottomWidth: item === options[options.length - 1] ? 0 : 1 },
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionText, value === item && styles.selectedOptionText]}>
        {item}
      </Text>
      {value === item && (
        <Icon name="checkmark" size={16} color={COLORS.accent.green} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdownButton, style, disabled && styles.disabled]}
        onPress={() => !disabled && setIsOpen(true)}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text
          style={[
            styles.dropdownText,
            isPlaceholder && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Icon
          name="chevron-down"
          size={20}
          color={isPlaceholder ? COLORS.text.disabled : COLORS.text.secondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            {modalTitle && (
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modalTitle}</Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Icon name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
            )}
            
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border.default,
    minHeight: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  dropdownText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.text.disabled,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    width: '100%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: COLORS.border.default,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  modalTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  selectedOption: {
    backgroundColor: COLORS.background.secondary,
  },
  optionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    flex: 1,
  },
  selectedOptionText: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
});
