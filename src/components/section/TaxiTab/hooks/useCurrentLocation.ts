import { useCallback, useEffect, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    // iOS에서는 권한이 거절된 상태에서 requestAuthorization을 호출해도
    // success 콜백이 호출될 수 있으므로, 실제로 위치를 가져올 수 있는지 확인합니다
    return new Promise<boolean>((resolve) => {
      // iOS에서 권한이 거절된 상태라면 getCurrentPosition을 호출하면 즉시 에러가 발생합니다
      // 따라서 먼저 getCurrentPosition을 호출해서 권한 상태를 확인하고,
      // 에러가 발생하면 requestAuthorization을 호출하여 권한을 요청합니다
      let permissionChecked = false;
      
      // 먼저 현재 권한 상태를 확인하기 위해 getCurrentPosition을 빠르게 호출
      Geolocation.getCurrentPosition(
        () => {
          // 위치를 가져올 수 있으면 권한이 허용된 것
          if (!permissionChecked) {
            permissionChecked = true;
            console.log('iOS 위치 권한 확인: 이미 허용됨');
            resolve(true);
          }
        },
        (error: any) => {
          // 에러가 발생하면 권한이 없거나 거절된 것
          // error.code === 1은 PERMISSION_DENIED를 의미
          if (error.code === 1) {
            // 권한이 거절된 상태
            if (!permissionChecked) {
              permissionChecked = true;
              console.warn('iOS 위치 권한 확인: 거절됨', error.code, error.message);
              resolve(false);
            }
          } else {
            // 권한이 not-determined 상태일 수 있으므로 requestAuthorization 호출
            if (!permissionChecked) {
              permissionChecked = true;
              console.log('iOS 위치 권한 확인: not-determined, 권한 요청');
              Geolocation.requestAuthorization(
                () => {
                  // 권한 요청 후 다시 getCurrentPosition 호출
                  Geolocation.getCurrentPosition(
                    () => {
                      console.log('iOS 위치 권한 확인: 요청 후 허용됨');
                      resolve(true);
                    },
                    (err: any) => {
                      console.warn('iOS 위치 권한 확인: 요청 후 실패', err.code, err.message);
                      resolve(false);
                    },
                    { enableHighAccuracy: false, timeout: 2000, maximumAge: 0 }
                  );
                },
                (err) => {
                  console.warn('iOS 위치 권한 요청 실패:', err);
                  resolve(false);
                }
              );
            }
          }
        },
        { enableHighAccuracy: false, timeout: 1000, maximumAge: 0 }
      );
    });
  }
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    console.log('Android 위치 권한 요청 결과:', granted);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return false;
};

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);

  const requestLocationPermissionInternal = useCallback(async () => {
    if (Platform.OS === 'ios') {
      // iOS에서는 getCurrentPosition을 호출하면 자동으로 권한 팝업이 표시됩니다
      // requestAuthorization은 권한 상태를 확인하지 않으므로, 
      // 실제 위치를 가져올 수 있는지 확인하기 위해 true를 반환하고
      // getCurrentPosition에서 에러가 발생하면 권한이 없는 것으로 처리합니다
      return true;
    }
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  }, []);

  const getLocation = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        // Android에서는 권한을 먼저 확인
        const hasPermission = await requestLocationPermissionInternal();
        if (!hasPermission) {
          setLocation(null);
          setLoading(false);
          return;
        }
      }
      // iOS와 Android 모두 getCurrentPosition 호출
      // iOS에서는 권한이 없으면 자동으로 팝업이 표시되고, 
      // 권한이 이미 허용되어 있으면 바로 위치를 가져옵니다
      Geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error('위치 정보를 가져오는데 실패했습니다:', error);
          setLocation(null);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error('위치 권한 요청 실패:', error);
      setLocation(null);
      setLoading(false);
    }
  }, [requestLocationPermissionInternal]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { location, loading, refresh: getLocation } as const;
};


