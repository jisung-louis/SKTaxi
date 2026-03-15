import firestore, { getFirestore } from '@react-native-firebase/firestore';

export const db = typeof getFirestore === 'function'
  ? getFirestore()
  : typeof firestore === 'function'
    ? firestore()
    : (firestore as any);
