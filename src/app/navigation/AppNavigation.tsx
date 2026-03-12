import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { AppNavigationRuntime } from './AppNavigationRuntime';
import { RootNavigator } from './RootNavigator';

export const AppNavigation = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
      <AppNavigationRuntime />
    </NavigationContainer>
  );
};
