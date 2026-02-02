// SKTaxi: 권한 상태 관리 훅
// React Native 권한 API 사용 (Firebase Messaging 포함)
//
// ⚠️ 특수 케이스 - Repository 추상화 불필요:
// 이 훅은 플랫폼 네이티브 API를 직접 사용합니다.
// - Firebase Messaging: 푸시 알림 권한 요청 (플랫폼 API)
// - Geolocation: 위치 권한 요청 (플랫폼 API)
//
// 이러한 플랫폼 API는 백엔드와 무관하게 클라이언트에서만 사용되므로
// Spring 마이그레이션 시에도 변경이 필요하지 않습니다.

import { useState, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { getMessaging, requestPermission, AuthorizationStatus } from '@react-native-firebase/messaging';
import Geolocation from '@react-native-community/geolocation';

export interface PermissionStatus {
  notification: boolean | null;
  location: boolean | null;
  needsOnboarding: boolean | null;
}

export const usePermissionStatus = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    notification: null,
    location: null,
    needsOnboarding: null,
  });

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await requestPermission(getMessaging());
        const granted = authStatus === AuthorizationStatus.AUTHORIZED;

        setPermissionStatus((prev) => ({
          ...prev,
          notification: granted,
          needsOnboarding: !(granted && prev.location),
        }));

        return granted;
      } else if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        if (typeof androidVersion === 'number' && androidVersion >= 33) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          const granted = result === PermissionsAndroid.RESULTS.GRANTED;

          setPermissionStatus((prev) => ({
            ...prev,
            notification: granted,
            needsOnboarding: !(granted && prev.location),
          }));

          return granted;
        } else {
          setPermissionStatus((prev) => ({
            ...prev,
            notification: true,
            needsOnboarding: !(true && prev.location),
          }));

          return true;
        }
      }
      return false;
    } catch (error) {
      console.warn('알림 권한 요청 실패:', error);
      return false;
    }
  }, []);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      let granted = false;

      if (Platform.OS === 'ios') {
        await new Promise<void>((resolve) => {
          Geolocation.requestAuthorization(
            () => {
              granted = true;
              resolve();
            },
            (error) => {
              console.warn('iOS 위치 권한 요청 실패:', error);
              granted = false;
              resolve();
            }
          );
        });
      } else if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        granted = result === PermissionsAndroid.RESULTS.GRANTED;
      }

      setPermissionStatus((prev) => ({
        ...prev,
        location: granted,
        needsOnboarding: !(prev.notification && granted),
      }));

      return granted;
    } catch (error) {
      console.warn('위치 권한 요청 실패:', error);
      setPermissionStatus((prev) => ({
        ...prev,
        location: false,
        needsOnboarding: !(prev.notification && false),
      }));
      return false;
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    setPermissionStatus((prev) => ({
      ...prev,
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
