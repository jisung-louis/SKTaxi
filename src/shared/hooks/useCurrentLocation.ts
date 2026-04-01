import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED?: number;
  POSITION_UNAVAILABLE?: number;
  TIMEOUT?: number;
}

const ANDROID_FAST_LOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 60000,
} as const;

const ANDROID_PRECISE_LOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 10000,
} as const;

const DEFAULT_LOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
} as const;

const getCurrentPositionAsync = (options: {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}) =>
  new Promise<Coordinates>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      reject,
      options,
    );
  });

const isRecoverableAndroidLocationError = (error: GeolocationError) =>
  error.code === error.TIMEOUT ||
  error.code === error.POSITION_UNAVAILABLE ||
  error.code === 2 ||
  error.code === 3;

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
    setLoading(true);

    try {
      if (Platform.OS === 'android') {
        const hasPermission = await requestLocationPermissionInternal();
        if (!hasPermission) {
          setLocation(null);
          setLoading(false);
          return;
        }
      }

      let currentLocation: Coordinates;

      if (Platform.OS === 'android') {
        try {
          currentLocation = await getCurrentPositionAsync(ANDROID_FAST_LOCATION_OPTIONS);
        } catch (error) {
          const locationError = error as GeolocationError;

          if (!isRecoverableAndroidLocationError(locationError)) {
            throw locationError;
          }

          console.warn(
            'Android 빠른 위치 조회 실패, 고정밀 위치 조회로 재시도합니다:',
            locationError,
          );
          currentLocation = await getCurrentPositionAsync(ANDROID_PRECISE_LOCATION_OPTIONS);
        }
      } else {
        currentLocation = await getCurrentPositionAsync(DEFAULT_LOCATION_OPTIONS);
      }

      setLocation(currentLocation);
      setLoading(false);
    } catch (error) {
      console.error('위치 정보를 가져오는데 실패했습니다:', error);
      setLocation(null);
      setLoading(false);
    }
  }, [requestLocationPermissionInternal]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { location, loading, refresh: getLocation } as const;
};
