import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  V2_COLORS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

const TAB_ICON_SIZE = 20;

const getTabLabel = (
  routeName: string,
  tabBarLabel: BottomTabBarProps['descriptors'][string]['options']['tabBarLabel'],
  title?: string,
) => {
  if (typeof tabBarLabel === 'string') {
    return tabBarLabel;
  }

  if (typeof title === 'string') {
    return title;
  }

  return routeName;
};

export const V2BottomTabBar = ({
  descriptors,
  navigation,
  state,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 0) },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const descriptor = descriptors[route.key];
          const { options } = descriptor;
          const tintColor = focused
            ? V2_COLORS.brand.primary
            : V2_COLORS.text.muted;
          const label = getTabLabel(
            route.name,
            options.tabBarLabel,
            options.title,
          );

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name as never, route.params as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              activeOpacity={0.8}
              onLongPress={onLongPress}
              onPress={onPress}
              style={styles.item}
              testID={options.tabBarButtonTestID}
            >
              <View style={styles.iconBox}>
                {options.tabBarIcon?.({
                  focused,
                  color: tintColor,
                  size: TAB_ICON_SIZE,
                })}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: tintColor },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.surface,
    borderTopColor: V2_COLORS.border.default,
    borderTopWidth: 1,
  },
  row: {
    flexDirection: 'row',
    height: 64,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    paddingTop: V2_SPACING.xs,
  },
  iconBox: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    minWidth: 28,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 15,
    textAlign: 'center',
  },
});
