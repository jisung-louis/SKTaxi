import { useCallback, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import { requestPushPermission } from '@/shared/lib/firebase/notificationPermission';

export interface PermissionStatus {
  notification: boolean | null;
  location: boolean | null;
  needsOnboarding: boolean | null;
}

const IOS_AUTHORIZATION_CALLBACK_WAIT_MS = 350;
const IOS_LOCATION_PROBE_TIMEOUT_MS = 1500;

const resolveIosLocationPermission = (): Promise<boolean> =>
  new Promise(resolve => {
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(value);
    };

    const fallbackTimer = setTimeout(() => {
      Geolocation.getCurrentPosition(
        () => {
          finish(true);
        },
        error => {
          if (error?.code === 1) {
            finish(false);
            return;
          }

          // Permission is likely already granted and only location fix failed.
          finish(true);
        },
        {
          enableHighAccuracy: false,
          maximumAge: 30000,
          timeout: IOS_LOCATION_PROBE_TIMEOUT_MS,
        },
      );
    }, IOS_AUTHORIZATION_CALLBACK_WAIT_MS);

    Geolocation.requestAuthorization(
      () => {
        clearTimeout(fallbackTimer);
        finish(true);
      },
      () => {
        clearTimeout(fallbackTimer);
        finish(false);
      },
    );
  });

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
        granted = await resolveIosLocationPermission();
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
