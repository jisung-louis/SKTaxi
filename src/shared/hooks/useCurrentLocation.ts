import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    return new Promise<boolean>((resolve) => {
      let permissionChecked = false;

      Geolocation.getCurrentPosition(
        () => {
          if (!permissionChecked) {
            permissionChecked = true;
            console.log('iOS 위치 권한 확인: 이미 허용됨');
            resolve(true);
          }
        },
        (error: any) => {
          if (error.code === 1) {
            if (!permissionChecked) {
              permissionChecked = true;
              console.warn('iOS 위치 권한 확인: 거절됨', error.code, error.message);
              resolve(false);
            }
          } else if (!permissionChecked) {
            permissionChecked = true;
            console.log('iOS 위치 권한 확인: not-determined, 권한 요청');
            Geolocation.requestAuthorization(
              () => {
                Geolocation.getCurrentPosition(
                  () => {
                    console.log('iOS 위치 권한 확인: 요청 후 허용됨');
                    resolve(true);
                  },
                  (err: any) => {
                    console.warn('iOS 위치 권한 확인: 요청 후 실패', err.code, err.message);
                    resolve(false);
                  },
                  { enableHighAccuracy: false, timeout: 2000, maximumAge: 0 },
                );
              },
              (err) => {
                console.warn('iOS 위치 권한 요청 실패:', err);
                resolve(false);
              },
            );
          }
        },
        { enableHighAccuracy: false, timeout: 1000, maximumAge: 0 },
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
        const hasPermission = await requestLocationPermissionInternal();
        if (!hasPermission) {
          setLocation(null);
          setLoading(false);
          return;
        }
      }

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
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
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
