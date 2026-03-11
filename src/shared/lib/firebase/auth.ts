import auth, { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

const resolveAuthInstance = () => {
  if (typeof getAuth === 'function') {
    return getAuth();
  }

  if (typeof auth === 'function') {
    return auth();
  }

  return auth as any;
};

export const authInstance = resolveAuthInstance();

export const subscribeAuthStateChange = (
  listener: (user: FirebaseAuthTypes.User | null) => void,
) => {
  if (typeof onAuthStateChanged === 'function') {
    return onAuthStateChanged(authInstance, listener);
  }

  if (typeof (authInstance as any)?.onAuthStateChanged === 'function') {
    return (authInstance as any).onAuthStateChanged(listener);
  }

  return () => {};
};
