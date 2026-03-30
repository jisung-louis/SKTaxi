import {
  impact,
  trigger,
} from 'react-native-haptic-feedback';

type HapticType = Parameters<typeof trigger>[0];
type NativeHapticOptions = NonNullable<Parameters<typeof trigger>[1]>;

const DEFAULT_HAPTIC_OPTIONS: NativeHapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export interface PlayHapticOptions extends Partial<NativeHapticOptions> {
  intensity?: number;
  type: HapticType;
}

export const playHaptic = ({
  intensity,
  type,
  ...options
}: PlayHapticOptions) => {
  const resolvedOptions = {
    ...DEFAULT_HAPTIC_OPTIONS,
    ...options,
  };

  if (typeof intensity === 'number') {
    impact(type, intensity, resolvedOptions);
    return;
  }

  trigger(type, resolvedOptions);
};
