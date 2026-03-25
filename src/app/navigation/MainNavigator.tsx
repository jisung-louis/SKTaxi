import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import { useNotificationPermissionBubble } from '@/app/bootstrap/useNotificationPermissionBubble';
import {
  useCommunityTabUnreadIndicator,
} from '@/features/chat';
import {
  JoinRequestProvider,
  useJoinRequestCount,
  useMyParty,
} from '@/features/taxi';
import PermissionBubble from '@/shared/ui/PermissionBubble';

import { AnimatedTabBar } from './components/AnimatedTabBar';
import { MAIN_TAB_LABELS } from './config/mainTabs';
import { CampusStackNavigator } from './navigators/CampusStackNavigator';
import { CommunityStackNavigator } from './navigators/CommunityStackNavigator';
import { NoticeStackNavigator } from './navigators/NoticeStackNavigator';
import { TaxiStackNavigator } from './navigators/TaxiStackNavigator';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigatorContent = () => {
  const { joinRequestCount } = useJoinRequestCount();
  const {
    bubbleVisible,
    checking,
    dismissBubble,
    allowNotification,
  } = useNotificationPermissionBubble();
  const { hasParty } = useMyParty();
  const { totalUnreadCount } = useCommunityTabUnreadIndicator();

  const renderAnimatedTabBar = React.useCallback(
    (props: BottomTabBarProps) => (
      <AnimatedTabBar
        {...props}
        hasCommunityUnread={totalUnreadCount > 0}
        hasTaxiParty={hasParty}
        taxiJoinRequestCount={joinRequestCount}
      />
    ),
    [hasParty, joinRequestCount, totalUnreadCount],
  );

  return (
    <>
      <Tab.Navigator
        tabBar={renderAnimatedTabBar}
        screenOptions={{
          headerShown: false,
          lazy: false,
        }}
        initialRouteName="CampusTab"
      >
        <Tab.Screen
          name="CampusTab"
          component={CampusStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.CampusTab,
            lazy: false,
          }}
        />
        <Tab.Screen
          name="TaxiTab"
          component={TaxiStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.TaxiTab,
          }}
        />
        <Tab.Screen
          name="NoticeTab"
          component={NoticeStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.NoticeTab,
            lazy: false,
          }}
        />
        <Tab.Screen
          name="CommunityTab"
          component={CommunityStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.CommunityTab,
            lazy: false,
          }}
        />
      </Tab.Navigator>
      {!checking && (
        <PermissionBubble
          visible={bubbleVisible}
          onAllowNotification={allowNotification}
          onClose={dismissBubble}
        />
      )}
    </>
  );
};

export const MainNavigator = () => {
  return (
    <JoinRequestProvider>
      <MainNavigatorContent />
    </JoinRequestProvider>
  );
};
