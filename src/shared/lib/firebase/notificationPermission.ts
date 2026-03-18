import { PermissionsAndroid, Platform } from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  hasPermission,
  requestPermission,
} from '@react-native-firebase/messaging';

const isIosPermissionGranted = (status: number): boolean =>
  status === AuthorizationStatus.AUTHORIZED;

const isAndroidNotificationRuntimePermissionRequired = (): boolean => {
  const version = typeof Platform.Version === 'number'
    ? Platform.Version
    : parseInt(Platform.Version, 10);

  return Number.isFinite(version) && version >= 33;
};

export const checkPushPermissionGranted = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const status = await hasPermission(getMessaging());
    return isIosPermissionGranted(status);
  }

  if (Platform.OS === 'android') {
    if (!isAndroidNotificationRuntimePermissionRequired()) {
      return true;
    }

    return PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }

  return false;
};

export const requestPushPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const status = await requestPermission(getMessaging());
    return isIosPermissionGranted(status);
  }

  if (Platform.OS === 'android') {
    if (!isAndroidNotificationRuntimePermissionRequired()) {
      return true;
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return false;
};
