import { triggerCrashlyticsCrash } from '@/shared/lib/firebase/crashlytics';

const SETTINGS_CRASHLYTICS_TEST_MESSAGE =
  'Manual crash test triggered on SettingScreen';

export const triggerSettingsCrashTest = (): void => {
  triggerCrashlyticsCrash(SETTINGS_CRASHLYTICS_TEST_MESSAGE);
};
