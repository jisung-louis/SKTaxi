import { useEffect, useState } from 'react';
import firestore, { collection, onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { Party } from '../types/party';

// SKTaxi: Firestore parties 컬렉션을 실시간 구독하여 Party 리스트를 제공하는 훅
export function useParties() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    // SKTaxi: createdAt 기준 내림차순 정렬로 구독
    const q = query(collection(firestore(getApp()), 'parties'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snap: FirebaseFirestoreTypes.QuerySnapshot) => {
          const next: Party[] = snap.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Party, 'id'>),
          }));
          setParties(next);
          setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { parties, loading, error } as const;
}


