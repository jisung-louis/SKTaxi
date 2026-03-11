import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { v2Colors, v2Radius, v2Typography } from '../foundation';
import { DISABLED_STATE_STYLE, PRESSED_STATE_STYLE, resolveV2Shadow } from './utils';

export interface GroupedListItem {
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  key: string;
  label: string;
  onPress?: () => void;
  testID?: string;
  trailing?: React.ReactNode;
}

export interface GroupedListProps {
  items: readonly GroupedListItem[];
  style?: StyleProp<ViewStyle>;
}

const DefaultChevron = () => (
  <Icon color={v2Colors.text.quaternary} name="chevron-forward" size={14} />
);

interface GroupedListRowProps {
  isLast: boolean;
  item: GroupedListItem;
}

const GroupedListRow = ({ isLast, item }: GroupedListRowProps) => {
  const disabled = item.disabled || !item.onPress;

  return (
    <Pressable
      accessibilityLabel={item.accessibilityLabel ?? item.label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowDivider,
        disabled && DISABLED_STATE_STYLE,
        pressed && !disabled && PRESSED_STATE_STYLE,
      ]}
      testID={item.testID}
    >
      <View style={styles.leadingSection}>
        {item.icon ? <View style={styles.iconBox}>{item.icon}</View> : null}
        <Text numberOfLines={1} style={styles.label}>
          {item.label}
        </Text>
      </View>
      <View style={styles.trailingSection}>
        {item.trailing ?? <DefaultChevron />}
      </View>
    </Pressable>
  );
};

export const GroupedList = ({ items, style }: GroupedListProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.clip}>
        {items.map((item, index) => (
          <GroupedListRow
            isLast={index === items.length - 1}
            item={item}
            key={item.key}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  clip: {
    borderRadius: v2Radius.xl,
    overflow: 'hidden',
  },
  container: {
    ...resolveV2Shadow('card'),
    backgroundColor: v2Colors.bg.surface,
    borderColor: v2Colors.border.subtle,
    borderRadius: v2Radius.xl,
    borderWidth: 1,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: v2Colors.bg.app,
    borderRadius: v2Radius.lg,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  label: {
    ...v2Typography.body.medium,
    color: v2Colors.text.primary,
    flex: 1,
  },
  leadingSection: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  row: {
    alignItems: 'center',
    backgroundColor: v2Colors.bg.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowDivider: {
    borderBottomColor: v2Colors.border.subtle,
    borderBottomWidth: 1,
  },
  trailingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    minWidth: 14,
  },
});
