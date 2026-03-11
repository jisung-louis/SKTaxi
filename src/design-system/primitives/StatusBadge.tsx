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

export type TaxiStatusBadgeState = 'closed' | 'recruiting';

interface PillStatusBadgeProps {
  label?: string;
  status: TaxiStatusBadgeState;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  textStyle?: StyleProp<TextStyle>;
  variant: 'pill';
}

interface CountStatusBadgeProps {
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  textStyle?: StyleProp<TextStyle>;
  value: string;
  variant: 'count';
}

export type StatusBadgeProps = CountStatusBadgeProps | PillStatusBadgeProps;

const taxiStatusColors = {
  closed: v2Colors.status.taxi.closed,
  recruiting: v2Colors.status.taxi.recruiting,
} as const;

export const StatusBadge = (props: StatusBadgeProps) => {
  if (props.variant === 'count') {
    return (
      <View
        accessibilityLabel={props.accessibilityLabel}
        accessible
        style={[styles.countBadge, props.style]}
        testID={props.testID}
      >
        <Text style={[styles.countText, props.textStyle]}>{props.value}</Text>
      </View>
    );
  }

  const statusColors = taxiStatusColors[props.status];
  const label = props.label ?? (props.status === 'recruiting' ? '모집중' : '마감');

  return (
    <View
      accessibilityLabel={label}
      accessible
      style={[styles.pillBadge, { backgroundColor: statusColors.bg }, props.style]}
      testID={props.testID}
    >
      <Text style={[styles.pillText, { color: statusColors.text }, props.textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  countBadge: {
    alignItems: 'center',
    backgroundColor: v2Colors.accent.green.base,
    borderRadius: v2Radius.full,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 2,
  },
  countText: {
    ...v2Typography.meta.default,
    color: v2Colors.text.inverse,
    fontWeight: '700',
  },
  pillBadge: {
    alignItems: 'center',
    borderRadius: v2Radius.full,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pillText: {
    ...v2Typography.meta.default,
    fontWeight: '700',
  },
});
