import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {CampusHomeQuickMenuItem} from '../constants/campusHomePreview';

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
    paddingHorizontal: SPACING.lg,
    paddingTop: 4,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: SPACING.md,
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
    borderRadius: RADIUS.lg,
    height: 56,
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    width: 56,
  },
  label: {
    color: COLORS.text.strong,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
  },
});
