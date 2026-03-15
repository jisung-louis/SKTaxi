import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {TaxiHomeSortOptionViewData} from '../../model/taxiHomeViewData';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface TaxiHomeSortMenuProps {
  onSelect: (sortId: TaxiHomeSortOptionViewData['id']) => void;
  options: TaxiHomeSortOptionViewData[];
  selectedLabel: string;
}

export const TaxiHomeSortMenu = ({
  onSelect,
  options,
  selectedLabel,
}: TaxiHomeSortMenuProps) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (sortId: TaxiHomeSortOptionViewData['id']) => {
    onSelect(sortId);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.85}
        onPress={() => setOpen(previous => !previous)}
        style={styles.trigger}>
        <Text style={styles.triggerLabel}>{selectedLabel}</Text>
        <Icon
          color={V2_COLORS.text.secondary}
          name={open ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={16}
        />
      </TouchableOpacity>
      {open ? (
        <>
          <Pressable onPress={() => setOpen(false)} style={styles.overlay} />
          <View style={styles.menu}>
            {options.map(option => (
              <TouchableOpacity
                key={option.id}
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => handleSelect(option.id)}
                style={[
                  styles.menuItem,
                  option.selected ? styles.menuItemSelected : null,
                ]}>
                <Text
                  style={[
                    styles.menuItemLabel,
                    option.selected ? styles.menuItemLabelSelected : null,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  trigger: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  triggerLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  menu: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.md,
    borderWidth: 1,
    minWidth: 124,
    paddingVertical: V2_SPACING.xs,
    position: 'absolute',
    right: 0,
    top: 24,
    zIndex: 20,
    ...V2_SHADOWS.raised,
  },
  overlay: {
    bottom: -9999,
    left: -9999,
    position: 'absolute',
    right: -9999,
    top: -9999,
    zIndex: 10,
  },
  menuItem: {
    paddingHorizontal: V2_SPACING.md,
    paddingVertical: V2_SPACING.sm,
  },
  menuItemSelected: {
    backgroundColor: V2_COLORS.brand.primaryTint,
  },
  menuItemLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  menuItemLabelSelected: {
    color: V2_COLORS.brand.primaryStrong,
    fontWeight: '600',
  },
});
