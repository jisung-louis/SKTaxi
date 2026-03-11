import crashlytics, { getCrashlytics, log } from '@react-native-firebase/crashlytics';

const crashlyticsInstance = typeof getCrashlytics === 'function'
  ? getCrashlytics()
  : typeof crashlytics === 'function'
    ? crashlytics()
    : (crashlytics as any);

export const logCrashlyticsMessage = (message: string): void => {
  if (typeof log === 'function') {
    log(crashlyticsInstance, message);
    return;
  }

  if (typeof (crashlyticsInstance as any)?.log === 'function') {
    (crashlyticsInstance as any).log(message);
  }
};
