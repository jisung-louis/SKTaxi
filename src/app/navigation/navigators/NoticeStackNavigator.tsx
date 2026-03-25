import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { type NoticeStackParamList } from '@/app/navigation/types';
import {
  NoticeDetailScreen,
  NoticeScreen,
} from '@/features/notice';

const NoticeStack = createNativeStackNavigator<NoticeStackParamList>();

export const NoticeStackNavigator = () => {
  return (
    <NoticeStack.Navigator screenOptions={{ headerShown: false }}>
      <NoticeStack.Screen name="NoticeMain" component={NoticeScreen} />
      <NoticeStack.Screen name="NoticeDetail" component={NoticeDetailScreen} />
    </NoticeStack.Navigator>
  );
};
