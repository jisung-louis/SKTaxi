/**
 * @deprecated 이 훅은 Firebase 직접 접근으로 DIP 원칙 위반.
 * 새로운 코드에서는 hooks/party/useParties 사용 권장.
 * import { useParties } from '../hooks/party';
 */

import { useEffect, useState } from 'react';
import firestore, { collection, onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { Party } from '../../types/party';

/** @deprecated hooks/party/useParties 사용 권장 */
export function useParties() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    // SKTaxi: createdAt 기준 내림차순 정렬로 구독
    // status가 'ended'인 파티는 목록에서 제외 (소프트 삭제된 파티)
    const q = query(
      collection(firestore(getApp()), 'parties'),
      orderBy('createdAt', 'desc'),
    );
    const unsubscribe = onSnapshot(
      q,
      (snap: FirebaseFirestoreTypes.QuerySnapshot) => {
          const next: Party[] = snap.docs
            .map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Party, 'id'>),
            }))
            // ended 상태(소프트 삭제된 파티)는 클라이언트 목록에서 제외
            .filter((party) => party.status !== 'ended');
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


