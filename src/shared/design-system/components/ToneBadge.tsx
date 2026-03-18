import React from 'react';
import {StyleSheet, Text, View, type StyleProp, type ViewStyle} from 'react-native';

import type {ContentDetailBadgeTone} from '@/shared/types/contentDetailViewData';

import {V2_COLORS, V2_RADIUS, V2_SPACING} from '../tokens';

interface ToneBadgeProps {
  label: string;
  style?: StyleProp<ViewStyle>;
  tone: ContentDetailBadgeTone;
}

const getToneStyle = (tone: ContentDetailBadgeTone) => {
  switch (tone) {
    case 'blue':
      return {
        backgroundColor: V2_COLORS.accent.blueSoft,
        textColor: V2_COLORS.accent.blue,
      };
    case 'green':
      return {
        backgroundColor: V2_COLORS.brand.primaryTint,
        textColor: V2_COLORS.brand.primaryStrong,
      };
    case 'orange':
      return {
        backgroundColor: V2_COLORS.accent.orangeSoft,
        textColor: V2_COLORS.accent.orange,
      };
    case 'pink':
      return {
        backgroundColor: V2_COLORS.accent.pinkSoft,
        textColor: V2_COLORS.accent.pink,
      };
    case 'purple':
      return {
        backgroundColor: V2_COLORS.accent.purpleSoft,
        textColor: V2_COLORS.accent.purple,
      };
    case 'gray':
    default:
      return {
        backgroundColor: V2_COLORS.background.subtle,
        textColor: V2_COLORS.text.tertiary,
      };
  }
};

export const ToneBadge = ({label, style, tone}: ToneBadgeProps) => {
  const toneStyle = getToneStyle(tone);

  return (
    <View
      style={[
        styles.badge,
        {backgroundColor: toneStyle.backgroundColor},
        style,
      ]}>
      <Text style={[styles.label, {color: toneStyle.textColor}]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    justifyContent: 'center',
    minHeight: 24,
    paddingHorizontal: 10,
    paddingVertical: V2_SPACING.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
