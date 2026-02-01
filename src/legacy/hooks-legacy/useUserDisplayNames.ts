/**
 * @deprecated 이 훅은 Firebase 직접 접근으로 DIP 원칙 위반.
 * 새로운 코드에서는 hooks/user/useUserDisplayNames 사용 권장.
 * import { useUserDisplayNames } from '../hooks/user';
 */

import { useEffect, useMemo, useState } from 'react';
import firestore, { collection, getDocs, query, where } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

/** @deprecated hooks/user/useUserDisplayNames 사용 권장 */
export function useUserDisplayNames(uids: string[]) {
  const [map, setMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  // SKTaxi: 의존성 안정화를 위해 값 기반 키 생성 (정렬 + join)
  const uidKey = useMemo(() => {
    const uniq = Array.from(new Set((uids || []).filter(Boolean)));
    uniq.sort();
    return uniq.join(',');
  }, [uids]);
  const uniqueUids = useMemo(() => (uidKey ? uidKey.split(',') : []), [uidKey]);

  useEffect(() => {
    if (!uniqueUids.length) {
      setMap({});
      setLoading(false);
      return;
    }
    setLoading(true);
    // SKTaxi: in 쿼리는 10개 단위 제한이 있으므로, 필요 시 청크 처리
    const chunkSize = 10;
    const chunks: string[][] = [];
    for (let i = 0; i < uniqueUids.length; i += chunkSize) {
      chunks.push(uniqueUids.slice(i, i + chunkSize));
    }

    let isCancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          chunks.map((chunk) => getDocs(query(
            collection(firestore(getApp()), 'users'),
            // SKTaxi: FieldPath.documentId() 타입 이슈 회피 → '__name__' 사용
            where('__name__', 'in', chunk)
          )))
        );
        if (isCancelled) return;
        const next: Record<string, string> = {};
        results.forEach((snap: FirebaseFirestoreTypes.QuerySnapshot) => {
          snap.docs.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const data: any = docSnap.data();
            next[docSnap.id] = data?.displayName || data?.email || docSnap.id;
          });
        });
        setMap(next);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [uniqueUids]);

  return { displayNameMap: map, loading } as const;
}


