import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { HIDDEN_BOTTOM_TAB_SCREENS } from '@/app/navigation/config/mainTabs';
import { type MainTabParamList } from '@/app/navigation/types';

import { V2BottomTabBar } from './V2BottomTabBar';

export type AnimatedTabBarProps = BottomTabBarProps & {
  hasCommunityUnread: boolean;
  hasTaxiParty: boolean;
  taxiJoinRequestCount: number;
};

export const AnimatedTabBar = ({
  hasCommunityUnread,
  hasTaxiParty,
  taxiJoinRequestCount,
  ...tabBarProps
}: AnimatedTabBarProps) => {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  const shouldHide = React.useMemo(() => {
    const currentRoute = tabBarProps.state.routes[tabBarProps.state.index];
    const tabName = currentRoute.name as keyof MainTabParamList;
    const focusedChildName =
      getFocusedRouteNameFromRoute(currentRoute) ?? 'UNKNOWN';
    const hiddenList = HIDDEN_BOTTOM_TAB_SCREENS[tabName] || [];

    return hiddenList.includes(focusedChildName);
  }, [tabBarProps.state]);

  React.useEffect(() => {
    if (shouldHide) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 100,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, shouldHide, translateY]);

  return (
    <Animated.View
      pointerEvents={shouldHide ? 'none' : 'auto'}
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <V2BottomTabBar
        {...tabBarProps}
        hasCommunityUnread={hasCommunityUnread}
        hasTaxiParty={hasTaxiParty}
        taxiJoinRequestCount={taxiJoinRequestCount}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    elevation: 1000,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1000,
  },
});
