import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import type {CampusHomeQuickMenuItem} from '../../constants/campusHomePreview';

type CampusQuickMenuGridProps = {
  items: readonly CampusHomeQuickMenuItem[];
  onPressItem: (routeName: CampusHomeQuickMenuItem['routeName']) => void;
};

export const CampusQuickMenuGrid = ({
  items,
  onPressItem,
}: CampusQuickMenuGridProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>빠른 메뉴</Text>
      <View style={styles.grid}>
        {items.map(item => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.82}
            onPress={() => onPressItem(item.routeName)}
            style={styles.item}>
            <View
              style={[
                styles.iconBox,
                {backgroundColor: item.backgroundColor},
              ]}>
              <Icon color={item.iconColor} name={item.icon} size={22} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: 4,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: V2_SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
    width: 76,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.lg,
    height: 56,
    justifyContent: 'center',
    marginBottom: V2_SPACING.sm,
    width: 56,
  },
  label: {
    color: V2_COLORS.text.strong,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
  },
});
