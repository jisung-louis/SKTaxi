export const logAnalyticsEvent = async (
  _eventName: string,
  _params?: Record<string, string | number | boolean | null>,
) => {};

export const setAnalyticsUserId = async (_uid: string | null) => {};

export const setAnalyticsUserProperties = async (_props: Record<string, string>) => {};
