import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { TaxiScreen } from '../screens/TaxiScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { COLORS } from '../constants/colors';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.background.primary,
          borderTopColor: COLORS.border.default,
          backfaceVisibility: 'hidden',
          borderCurve: 'circular',
          height: BOTTOM_TAB_BAR_HEIGHT,
        },
        tabBarActiveTintColor: COLORS.accent.green,
        tabBarInactiveTintColor: COLORS.text.secondary,
        headerShown: false,
      }}
      initialRouteName="홈"
    >
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="택시" component={TaxiScreen} />
      <Tab.Screen name="게시판" component={ChatScreen} />
      <Tab.Screen name="공지" component={ProfileScreen} />
    </Tab.Navigator>
  );
}; 