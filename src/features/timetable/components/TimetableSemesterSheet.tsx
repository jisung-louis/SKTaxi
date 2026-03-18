import React from 'react';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '@/shared/design-system/tokens';

import type {TimetableSemesterOptionViewData} from '../../model/timetableDetailViewData';
import {TimetableBottomSheet} from './TimetableBottomSheet';

const SEMESTER_SNAP_POINTS = ['42%'];

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
    <TimetableBottomSheet
      onClose={onClose}
      snapPoints={SEMESTER_SNAP_POINTS}
      visible={visible}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>학기 선택</Text>
        <TouchableOpacity
          accessibilityLabel="닫기"
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onClose}
          style={styles.closeButton}>
          <Icon color={V2_COLORS.text.secondary} name="close" size={18} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
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
                <Icon
                  color={V2_COLORS.brand.primaryStrong}
                  name="checkmark"
                  size={18}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </BottomSheetScrollView>
    </TimetableBottomSheet>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingTop: 8,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  list: {
    paddingTop: 8,
    rowGap: V2_SPACING.sm,
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
    color: V2_COLORS.text.strong,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  optionLabelSelected: {
    color: V2_COLORS.brand.primaryStrong,
    fontWeight: '700',
  },
});
