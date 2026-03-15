import {
  logAnalyticsEvent,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
} from '@/shared/lib/firebase';

export const logEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean | null>,
) => {
  try {
    await logAnalyticsEvent(eventName, params);
  } catch (error) {
    console.warn('analytics.logEvent error', error);
  }
};

export const logScreenView = async (
  screenName: string,
  screenClass?: string,
) => {
  try {
    await logAnalyticsEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass ?? screenName,
    } as any);
  } catch (error) {
    console.warn('analytics.logScreenView error', error);
  }
};

export const setUserId = async (uid: string | null) => {
  try {
    await setAnalyticsUserId(uid);
  } catch (error) {
    console.warn('analytics.setUserId error', error);
  }
};

export const setUserProperties = async (props: Record<string, string>) => {
  try {
    await setAnalyticsUserProperties(props);
  } catch (error) {
    console.warn('analytics.setUserProperties error', error);
  }
};
