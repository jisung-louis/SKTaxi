import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { v2Colors, v2Radius, v2Typography } from '../foundation';

export type CategoryTagTone = keyof typeof v2Colors.category | 'custom';

export interface CategoryTagColors {
  background: string;
  text: string;
}

export interface CategoryTagProps {
  colors?: CategoryTagColors;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  tone?: CategoryTagTone;
}

const categoryToneColors: Record<keyof typeof v2Colors.category, CategoryTagColors> = {
  academic: {
    background: v2Colors.category.academic.bg,
    text: v2Colors.category.academic.text,
  },
  career: {
    background: v2Colors.category.career.bg,
    text: v2Colors.category.career.text,
  },
  facility: {
    background: v2Colors.category.facility.bg,
    text: v2Colors.category.facility.text,
  },
  scholarship: {
    background: v2Colors.category.scholarship.bg,
    text: v2Colors.category.scholarship.text,
  },
};

export const CategoryTag = ({
  colors,
  label,
  labelStyle,
  style,
  tone = 'academic',
}: CategoryTagProps) => {
  // `event` tone is still unresolved in the docs, so callers can inject
  // explicit colors without baking in a provisional token here.
  const resolvedColors = tone === 'custom'
    ? colors ?? {
      background: v2Colors.bg.subtle,
      text: v2Colors.text.secondary,
    }
    : colors ?? categoryToneColors[tone];

  return (
    <View style={[styles.container, { backgroundColor: resolvedColors.background }, style]}>
      <Text numberOfLines={1} style={[styles.label, { color: resolvedColors.text }, labelStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: v2Radius.sm,
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  label: {
    ...v2Typography.meta.medium,
  },
});
