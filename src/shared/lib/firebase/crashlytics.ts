export const logCrashlyticsMessage = (message: string): void => {
  console.info('[mock-crashlytics]', message);
};

export const triggerCrashlyticsCrash = (message: string): void => {
  logCrashlyticsMessage(message);
};
