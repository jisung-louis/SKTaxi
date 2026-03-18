import analytics, {
  getAnalytics,
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties,
} from '@react-native-firebase/analytics';

const analyticsInstance = typeof getAnalytics === 'function'
  ? getAnalytics()
  : typeof analytics === 'function'
    ? analytics()
    : (analytics as any);

export const logAnalyticsEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean | null>,
) => {
  if (typeof firebaseLogEvent === 'function') {
    await firebaseLogEvent(analyticsInstance, eventName as any, params as any);
    return;
  }

  await (analyticsInstance as any)?.logEvent?.(eventName, params);
};

export const setAnalyticsUserId = async (uid: string | null) => {
  if (typeof firebaseSetUserId === 'function') {
    await firebaseSetUserId(analyticsInstance, uid);
    return;
  }

  await (analyticsInstance as any)?.setUserId?.(uid);
};

export const setAnalyticsUserProperties = async (props: Record<string, string>) => {
  if (typeof firebaseSetUserProperties === 'function') {
    await firebaseSetUserProperties(analyticsInstance, props as any);
    return;
  }

  await (analyticsInstance as any)?.setUserProperties?.(props);
};
