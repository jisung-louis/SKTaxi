import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '@/shared/design-system/tokens';

import type {TimetableSemesterOptionViewData} from '../../model/timetableDetailViewData';
import {TimetableBottomSheet} from './TimetableBottomSheet';

interface TimetableSemesterSheetProps {
  onClose: () => void;
  onSelectSemester: (semesterId: string) => void;
  options: TimetableSemesterOptionViewData[];
  selectedLabel: string;
  visible: boolean;
}

export const TimetableSemesterSheet = ({
  onClose,
  onSelectSemester,
  options,
  selectedLabel,
  visible,
}: TimetableSemesterSheetProps) => {
  return (
    <TimetableBottomSheet onClose={onClose} visible={visible}>
      <Text style={styles.title}>학기 선택</Text>
      <View style={styles.list}>
        {options.map(option => {
          const selected = option.label === selectedLabel;

          return (
            <TouchableOpacity
              key={option.id}
              accessibilityRole="button"
              activeOpacity={0.88}
              onPress={() => {
                onSelectSemester(option.id);
                onClose();
              }}
              style={[styles.option, selected ? styles.optionSelected : null]}>
              <Text
                style={[
                  styles.optionLabel,
                  selected ? styles.optionLabelSelected : null,
                ]}>
                {option.label}
              </Text>
              {selected ? (
                <Icon color={V2_COLORS.brand.primaryStrong} name="checkmark" size={20} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </TimetableBottomSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: V2_SPACING.lg,
  },
  list: {
    gap: V2_SPACING.sm,
  },
  option: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.lg,
  },
  optionSelected: {
    backgroundColor: V2_COLORS.brand.primaryTint,
    ...V2_SHADOWS.card,
  },
  optionLabel: {
    color: V2_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  optionLabelSelected: {
    color: V2_COLORS.brand.primaryStrong,
    fontWeight: '800',
  },
});
