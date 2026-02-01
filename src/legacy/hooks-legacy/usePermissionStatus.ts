import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
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
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const granted = authStatus === messaging.AuthorizationStatus.AUTHORIZED;
        
        setPermissionStatus(prev => ({
          ...prev,
          notification: granted,
          needsOnboarding: !(granted && prev.location),
        }));
        
        return granted;
      } else if (Platform.OS === 'android') {
        // Android 13 (API 33) 이상에서만 POST_NOTIFICATIONS 권한이 필요
        const androidVersion = Platform.Version;
        if (androidVersion >= 33) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          const granted = result === PermissionsAndroid.RESULTS.GRANTED;
          
          setPermissionStatus(prev => ({
            ...prev,
            notification: granted,
            needsOnboarding: !(granted && prev.location),
          }));
          
          return granted;
        } else {
          // Android 12 이하는 알림 권한이 자동으로 허용됨
          setPermissionStatus(prev => ({
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
        // @react-native-community/geolocation의 requestAuthorization 사용
        await new Promise<void>((resolve) => {
          Geolocation.requestAuthorization(
            () => {
              // 권한 요청 성공
              granted = true;
              resolve();
            },
            (error) => {
              // 권한 요청 실패
              console.warn('iOS 위치 권한 요청 실패:', error);
              granted = false;
              resolve(); // 에러가 발생해도 Promise는 resolve하여 다음 단계로 진행
            }
          );
        });
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
      setPermissionStatus(prev => ({
        ...prev,
        location: false,
        needsOnboarding: !(prev.notification && false),
      }));
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
