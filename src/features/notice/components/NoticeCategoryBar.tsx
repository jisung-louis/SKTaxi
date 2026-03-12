import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';

import { NOTICE_CATEGORIES } from '../model/constants';

interface NoticeCategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function NoticeCategoryBar({
  selectedCategory,
  onSelectCategory,
}: NoticeCategoryBarProps) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryBar}
      >
        {NOTICE_CATEGORIES.map((category) => {
          const active = category === selectedCategory;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
              onPress={() => onSelectCategory(category)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  active && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: `${COLORS.accent.green}20`,
    borderColor: COLORS.accent.green,
  },
  categoryChipText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '600',
    lineHeight: 18,
  },
  categoryChipTextActive: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
});
