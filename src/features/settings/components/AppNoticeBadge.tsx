import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {COLORS, RADIUS, SPACING} from '@/shared/design-system/tokens';

import type {AppNoticeBadgeViewData} from '../model/appNoticeViewData';

type AppNoticeBadgeProps = {
  badge: AppNoticeBadgeViewData;
};

const getToneStyle = (tone: AppNoticeBadgeViewData['tone']) => {
  if (tone === 'danger') {
    return {
      backgroundColor: COLORS.accent.pinkSoft,
      textColor: COLORS.status.danger,
    };
  }

  return {
    backgroundColor: COLORS.background.subtle,
    textColor: COLORS.text.muted,
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
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    minHeight: 24,
    paddingHorizontal: 10,
    paddingVertical: SPACING.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
