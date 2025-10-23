import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { formatSemesterDisplay } from '../../utils/timetableUtils';

interface SemesterDropdownProps {
  selectedSemester: string;
  onSemesterChange: (semester: string) => void;
  semesterOptions: string[];
}

export const SemesterDropdown: React.FC<SemesterDropdownProps> = ({
  selectedSemester,
  onSemesterChange,
  semesterOptions,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSemesterSelect = (semester: string) => {
    onSemesterChange(semester);
    setIsOpen(false);
  };

  const renderSemesterOption = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        selectedSemester === item && styles.selectedOption,
        {borderBottomWidth: item === semesterOptions[semesterOptions.length - 1] ? 0 : 1}
      ]}
      onPress={() => handleSemesterSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.optionText,
        selectedSemester === item && styles.selectedOptionText
      ]}>
        {formatSemesterDisplay(item)}
      </Text>
      {selectedSemester === item && (
        <Icon name="checkmark" size={16} color={COLORS.accent.blue} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownText}>
          {formatSemesterDisplay(selectedSemester)}
        </Text>
        <Icon name="chevron-down" size={24} color={COLORS.text.primary} />
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>학기 선택</Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
              >
                <Icon name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={semesterOptions}
              renderItem={renderSemesterOption}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownText: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
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
    borderColor: COLORS.border.dark,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  modalTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.dark,
  },
  selectedOption: {
    backgroundColor: COLORS.background.secondary,
  },
  optionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  selectedOptionText: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
});
