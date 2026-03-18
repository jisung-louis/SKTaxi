import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {
  MyPageMenuItemViewData,
  MyPageMenuSectionViewData,
} from '../../model/myPageViewData';

interface MyPageMenuSectionProps {
  onPressItem: (item: MyPageMenuItemViewData) => void;
  section: MyPageMenuSectionViewData;
}

export const MyPageMenuSection = ({
  onPressItem,
  section,
}: MyPageMenuSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>

      <View style={styles.card}>
        {section.items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => onPressItem(item)}
            style={[
              styles.row,
              index < section.items.length - 1 ? styles.rowBorder : undefined,
            ]}>
            <View style={styles.leftGroup}>
              <View
                style={[
                  styles.iconWrap,
                  {backgroundColor: item.iconBackgroundColor},
                ]}>
                <Icon color={item.iconColor} name={item.iconName} size={20} />
              </View>

              <Text style={styles.label}>{item.label}</Text>
            </View>

            <Icon
              color={COLORS.text.muted}
              name="chevron-forward"
              size={16}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: SPACING.md,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 72,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  rowBorder: {
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
  },
  leftGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  label: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
