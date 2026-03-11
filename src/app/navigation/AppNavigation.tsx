import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { RootNavigator } from './RootNavigator';

export const AppNavigation = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};
