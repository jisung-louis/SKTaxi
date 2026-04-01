import React, { PropsWithChildren } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';

import { RootNavigator } from './RootNavigator';

export const AppNavigation = ({ children }: PropsWithChildren) => {
  const handleNavigationReady = () => {
    BootSplash.hide({fade: true});
  };

  return (
    <NavigationContainer onReady={handleNavigationReady}>
      <RootNavigator />
      {children}
    </NavigationContainer>
  );
};
