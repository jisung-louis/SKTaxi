import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import Geolocation from 'react-native-geolocation-service';

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

  const checkNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      // 알림 권한 상태만 확인 (요청하지 않음)
      // 기본적으로 권한이 없다고 가정하고, 실제 사용 시에만 권한 요청
      return false; // 온보딩이 필요하다고 가정
    } catch (error) {
      console.warn('알림 권한 확인 실패:', error);
      return false;
    }
  }, []);

  const checkLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        // iOS에서는 권한 상태만 확인 (요청하지 않음)
        // 기본적으로 권한이 없다고 가정하고, 실제 사용 시에만 권한 요청
        return false; // 온보딩이 필요하다고 가정
      } else if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted;
      }
      return false;
    } catch (error) {
      // 에러 시 권한 없음으로 간주
      return false;
    }
  }, []);

  // 자동 권한 확인/요청 로직 제거: 온보딩 화면에서만 명시적으로 요청

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const authStatus = await messaging().requestPermission();
      const granted = authStatus === messaging.AuthorizationStatus.AUTHORIZED;
      
      setPermissionStatus(prev => ({
        ...prev,
        notification: granted,
        needsOnboarding: !(granted && prev.location),
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
        const authStatus = await Geolocation.requestAuthorization('whenInUse');
        granted = authStatus === 'granted';
      } else if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        granted = result === PermissionsAndroid.RESULTS.GRANTED;
      }

      setPermissionStatus(prev => ({
        ...prev,
        location: granted,
        needsOnboarding: !(prev.notification && granted),
      }));

      return granted;
    } catch (error) {
      console.warn('위치 권한 요청 실패:', error);
      return false;
    }
  }, []);

  // 권한 온보딩 완료 처리
  const completeOnboarding = useCallback(() => {
    setPermissionStatus(prev => ({
      ...prev,
      needsOnboarding: false,
    }));
  }, []);

  // 초기 자동 확인 제거

  return {
    ...permissionStatus,
    requestNotificationPermission,
    requestLocationPermission,
    completeOnboarding,
  };
};
