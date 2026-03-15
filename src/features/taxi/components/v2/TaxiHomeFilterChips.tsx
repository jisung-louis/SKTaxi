import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import type {TaxiHomeFilterChipViewData} from '../../model/taxiHomeViewData';
import {V2_COLORS, V2_RADIUS, V2_SPACING} from '@/shared/design-system/tokens';

interface TaxiHomeFilterChipsProps {
  filters: TaxiHomeFilterChipViewData[];
  onPressFilter: (filterId: TaxiHomeFilterChipViewData['id']) => void;
}

export const TaxiHomeFilterChips = ({
  filters,
  onPressFilter,
}: TaxiHomeFilterChipsProps) => {
  return (
    <View style={styles.row}>
      {filters.map(filter => (
        <TouchableOpacity
          key={filter.id}
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={() => onPressFilter(filter.id)}
          style={[
            styles.chip,
            filter.selected ? styles.chipSelected : styles.chipDefault,
          ]}>
          <Text
            style={[
              styles.label,
              filter.selected ? styles.labelSelected : styles.labelDefault,
            ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  chip: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.lg,
  },
  chipDefault: {
    backgroundColor: V2_COLORS.background.subtle,
  },
  chipSelected: {
    backgroundColor: V2_COLORS.brand.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  labelDefault: {
    color: V2_COLORS.text.secondary,
  },
  labelSelected: {
    color: V2_COLORS.text.inverse,
  },
});
