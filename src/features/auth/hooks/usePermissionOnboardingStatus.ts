import { useCallback, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import { requestPushPermission } from '@/shared/lib/firebase/notificationPermission';

export interface PermissionStatus {
  notification: boolean | null;
  location: boolean | null;
  needsOnboarding: boolean | null;
}

export const usePermissionOnboardingStatus = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    notification: null,
    location: null,
    needsOnboarding: null,
  });

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await requestPushPermission();

      setPermissionStatus(previous => ({
        ...previous,
        notification: granted,
        needsOnboarding: !(granted && previous.location),
      }));

      return granted;
    } catch (error) {
      console.warn('알림 권한 요청 실패:', error);
      return false;
    }
  }, []);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      let granted = false;

      if (Platform.OS === 'ios') {
        await new Promise<void>(resolve => {
          Geolocation.requestAuthorization(
            () => {
              granted = true;
              resolve();
            },
            error => {
              console.warn('iOS 위치 권한 요청 실패:', error);
              granted = false;
              resolve();
            },
          );
        });
      } else if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        granted = result === PermissionsAndroid.RESULTS.GRANTED;
      }

      setPermissionStatus(previous => ({
        ...previous,
        location: granted,
        needsOnboarding: !(previous.notification && granted),
      }));

      return granted;
    } catch (error) {
      console.warn('위치 권한 요청 실패:', error);
      setPermissionStatus(previous => ({
        ...previous,
        location: false,
        needsOnboarding: !(previous.notification && false),
      }));
      return false;
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    setPermissionStatus(previous => ({
      ...previous,
      needsOnboarding: false,
    }));
  }, []);

  return {
    ...permissionStatus,
    requestNotificationPermission,
    requestLocationPermission,
    completeOnboarding,
  };
};
