import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';

import { logScreenView } from '@/shared/lib/analytics';

export const useScreenView = () => {
  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      const screenName = route.name;
      const nativeComponentNames = [
        'RNSScreen',
        'UIViewController',
        'RCTFabricModalHostViewController',
        'RCTAlertController',
        'SFAuthenticationViewController',
        'UIAlertController',
      ];

      if (
        screenName &&
        !nativeComponentNames.includes(screenName) &&
        screenName.trim() !== ''
      ) {
        logScreenView(screenName);
      }
    }, [route.name]),
  );
};
