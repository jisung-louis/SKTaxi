import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { v2Colors, v2Typography } from '../foundation';
import { PRESSED_STATE_STYLE } from './utils';

export interface TopSegmentTabOption {
  key: string;
  label: string;
}

export interface TopSegmentTabsProps {
  onSelect: (key: string) => void;
  options: readonly TopSegmentTabOption[];
  selectedKey: string;
  style?: StyleProp<ViewStyle>;
}

export const TopSegmentTabs = ({
  onSelect,
  options,
  selectedKey,
  style,
}: TopSegmentTabsProps) => {
  return (
    <View style={[styles.container, style]}>
      {options.map(option => {
        const selected = option.key === selectedKey;

        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={({ pressed }) => [
              styles.tab,
              selected && styles.tabSelected,
              pressed && PRESSED_STATE_STYLE,
            ]}
          >
            <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: v2Colors.bg.surface,
    borderBottomColor: v2Colors.border.default,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  label: {
    ...v2Typography.body.medium,
    fontWeight: '700',
  },
  labelDefault: {
    color: v2Colors.text.quaternary,
  },
  labelSelected: {
    color: v2Colors.accent.green.base,
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flex: 1,
    height: 54,
    justifyContent: 'center',
    paddingBottom: 2,
  },
  tabSelected: {
    borderBottomColor: v2Colors.accent.green.base,
  },
});
