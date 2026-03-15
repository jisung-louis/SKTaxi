import React, { PropsWithChildren } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { RootNavigator } from './RootNavigator';

export const AppNavigation = ({ children }: PropsWithChildren) => {
  return (
    <NavigationContainer>
      <RootNavigator />
      {children}
    </NavigationContainer>
  );
};
