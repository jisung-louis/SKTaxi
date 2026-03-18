import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {V2_COLORS, V2_RADIUS, V2_SPACING} from '@/shared/design-system/tokens';

import type {AppNoticeBadgeViewData} from '../../model/appNoticeViewData';

type AppNoticeBadgeProps = {
  badge: AppNoticeBadgeViewData;
};

const getToneStyle = (tone: AppNoticeBadgeViewData['tone']) => {
  if (tone === 'danger') {
    return {
      backgroundColor: V2_COLORS.accent.pinkSoft,
      textColor: V2_COLORS.status.danger,
    };
  }

  return {
    backgroundColor: V2_COLORS.background.subtle,
    textColor: V2_COLORS.text.muted,
  };
};

export const AppNoticeBadge = ({badge}: AppNoticeBadgeProps) => {
  const toneStyle = getToneStyle(badge.tone);

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: toneStyle.backgroundColor},
      ]}>
      <Text style={[styles.label, {color: toneStyle.textColor}]}>
        {badge.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    justifyContent: 'center',
    minHeight: 24,
    paddingHorizontal: 10,
    paddingVertical: V2_SPACING.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
