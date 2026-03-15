import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_SPACING,
} from '@/shared/design-system/tokens';
import { Dot } from '@/shared/ui/Dot';
import { TabBadge } from '@/shared/ui/TabBadge';

const TAB_ICON_SIZE = 20;

const TAB_ICON_NAMES = {
  CampusTab: {
    active: 'school',
    inactive: 'school-outline',
  },
  TaxiTab: {
    active: 'car',
    inactive: 'car-outline',
  },
  NoticeTab: {
    active: 'notifications',
    inactive: 'notifications-outline',
  },
  CommunityTab: {
    active: 'people',
    inactive: 'people-outline',
  },
} as const;

type V2BottomTabBarProps = BottomTabBarProps & {
  hasCommunityUnread?: boolean;
  hasTaxiParty?: boolean;
  taxiJoinRequestCount?: number;
};

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
  hasCommunityUnread = false,
  hasTaxiParty = false,
  navigation,
  state,
  taxiJoinRequestCount = 0,
}: V2BottomTabBarProps) => {
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
          const routeName =
            route.name as keyof typeof TAB_ICON_NAMES;
          const iconName = focused
            ? TAB_ICON_NAMES[routeName].active
            : TAB_ICON_NAMES[routeName].inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate({
                name: route.name,
                params: route.params,
              });
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
                <Icon
                  color={tintColor}
                  name={iconName}
                  size={TAB_ICON_SIZE}
                />
                {route.name === 'TaxiTab' && (
                  <>
                    <TabBadge
                      count={taxiJoinRequestCount}
                      location="bottom"
                      size="small"
                    />
                    {hasTaxiParty && (
                      <View style={styles.partyBadge}>
                        <Text style={styles.partyBadgeText}>파티</Text>
                      </View>
                    )}
                  </>
                )}
                {route.name === 'CommunityTab' && (
                  <Dot
                    visible={hasCommunityUnread}
                    size="small"
                    style={styles.chatUnreadDot}
                  />
                )}
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
    position: 'relative',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 15,
    textAlign: 'center',
  },
  chatUnreadDot: {
    bottom: -2,
    position: 'absolute',
    right: -6,
  },
  partyBadge: {
    backgroundColor: V2_COLORS.brand.primary,
    borderColor: V2_COLORS.background.surface,
    borderRadius: 10,
    borderWidth: 1,
    padding: 2,
    position: 'absolute',
    right: -8,
    top: 0,
  },
  partyBadgeText: {
    color: V2_COLORS.text.inverse,
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 10,
  },
});
