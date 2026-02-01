/**
 * @deprecated 이 훅은 Firebase 직접 접근으로 DIP 원칙 위반.
 * 새로운 코드에서는 hooks/party/useMyParty 사용 권장.
 * import { useMyParty } from '../hooks/party';
 */

import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore, { collection, onSnapshot, query, where, limit } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

/** @deprecated hooks/party/useMyParty 사용 권장 */
export function useMyParty() {
  const [hasParty, setHasParty] = useState<boolean>(false);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;
    let isMounted = true;

    const subscribeForUser = (uid: string) => {
      try {
        // SKTaxi: 안전한 대안 - parties 컬렉션에서 members array-contains 쿼리로 소속 파티 조회
        // ended(소프트 삭제) 상태 파티는 제외
        const q = query(
          collection(firestore(getApp()), 'parties'),
          where('members', 'array-contains', uid),
          where('status', 'in', ['open', 'closed', 'arrived']),
          limit(1)
        );
        unsubscribeFirestore = onSnapshot(
          q,
          (snap) => {
              if (!isMounted) return;
              if (!snap.empty) {
                const pid = snap.docs[0].id;
                setHasParty(true);
                setPartyId(pid);
              } else {
                setHasParty(false);
                setPartyId(null);
              }
              setLoading(false);
          },
          () => {
              if (!isMounted) return;
              setHasParty(false);
              setPartyId(null);
              setLoading(false);
          }
        );
      } catch (_) {
        if (!isMounted) return;
        setHasParty(false);
        setPartyId(null);
        setLoading(false);
      }
    };

    const unsubscribeAuth = auth(getApp()).onAuthStateChanged((user) => {
      // 기존 구독 해제
      if (unsubscribeFirestore) {
        try { unsubscribeFirestore(); } catch (_) {}
        unsubscribeFirestore = null;
      }

      if (!user) {
        if (!isMounted) return;
        setHasParty(false);
        setPartyId(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      subscribeForUser(user.uid);
    });

    return () => {
      isMounted = false;
      if (unsubscribeFirestore) {
        try { unsubscribeFirestore(); } catch (_) {}
      }
      unsubscribeAuth();
    };
  }, []);

  return { hasParty, partyId, loading } as const;
}


