import { getDatabase, onValue, ref } from '@react-native-firebase/database';

interface MinecraftRealtimeValueCallbacks<T> {
  onData: (value: T | null) => void;
  onError: (error: Error) => void;
}

export const subscribeToMinecraftRealtimeValue = <T>(
  path: string,
  { onData, onError }: MinecraftRealtimeValueCallbacks<T>,
) => {
  const realtimeDatabase = getDatabase();
  const valueRef = ref(realtimeDatabase, path);

  return onValue(
    valueRef,
    snapshot => {
      onData(snapshot.exists() ? (snapshot.val() as T) : null);
    },
    error => {
      onData(null);
      onError(error as Error);
    },
  );
};
