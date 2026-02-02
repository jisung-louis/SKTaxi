// SKTaxi: Analytics 모듈 - Firebase v22 Modular API
import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties,
} from '@react-native-firebase/analytics';

const analytics = getAnalytics();

export const logEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean | null>
) => {
  try {
    await firebaseLogEvent(analytics, eventName as any, params as any);
  } catch (error) {
    console.warn('analytics.logEvent error', error);
  }
};

export const logScreenView = async (
  screenName: string,
  screenClass?: string
) => {
  try {
    // logScreenView is deprecated, use logEvent with 'screen_view' instead
    await firebaseLogEvent(analytics, 'screen_view', {
      screen_name: screenName,
      screen_class: screenClass ?? screenName,
    } as any);
  } catch (error) {
    console.warn('analytics.logScreenView error', error);
  }
};

export const setUserId = async (uid: string | null) => {
  try {
    await firebaseSetUserId(analytics, uid);
  } catch (error) {
    console.warn('analytics.setUserId error', error);
  }
};

export const setUserProperties = async (props: Record<string, string>) => {
  try {
    await firebaseSetUserProperties(analytics, props as any);
  } catch (error) {
    console.warn('analytics.setUserProperties error', error);
  }
};
