import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  AcceptancePendingScreen,
  ChatScreen,
  RecruitScreen,
  TaxiLocationPickerScreen,
  TaxiScreen,
  type TaxiStackParamList,
} from '@/features/taxi';

const TaxiStack = createNativeStackNavigator<TaxiStackParamList>();

export const TaxiStackNavigator = () => {
  return (
    <TaxiStack.Navigator screenOptions={{ headerShown: false }}>
      <TaxiStack.Screen name="TaxiMain" component={TaxiScreen} />
      <TaxiStack.Screen
        name="AcceptancePending"
        component={AcceptancePendingScreen}
      />
      <TaxiStack.Screen name="Chat" component={ChatScreen} />
      <TaxiStack.Screen name="Recruit" component={RecruitScreen} />
      <TaxiStack.Screen
        name="TaxiLocationPicker"
        component={TaxiLocationPickerScreen}
      />
    </TaxiStack.Navigator>
  );
};
