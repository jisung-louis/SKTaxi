import analytics from '@react-native-firebase/analytics';

export const logEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean | null>
) => {
  try {
    await analytics().logEvent(eventName as any, params as any);
  } catch (error) {
    console.warn('analytics.logEvent error', error);
  }
};

export const logScreenView = async (
  screenName: string,
  screenClass?: string
) => {
  try {
    await analytics().logScreenView({ screen_name: screenName, screen_class: screenClass ?? screenName } as any);
  } catch (error) {
    console.warn('analytics.logScreenView error', error);
  }
};

export const setUserId = async (uid: string | null) => {
  try {
    await analytics().setUserId(uid ?? null);
  } catch (error) {
    console.warn('analytics.setUserId error', error);
  }
};

export const setUserProperties = async (props: Record<string, string>) => {
  try {
    await analytics().setUserProperties(props as any);
  } catch (error) {
    console.warn('analytics.setUserProperties error', error);
  }
};


