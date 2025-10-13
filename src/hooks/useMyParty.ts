import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore, { collection, onSnapshot, query, where, limit } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

// SKTaxi: 현재 로그인 사용자가 어떤 파티의 members 하위문서(파티원)로 존재하는지 감지하는 훅
// 구조: partyMembers/{partyId}/members/{uid}
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
        const q = query(
          collection(firestore(getApp()), 'parties'),
          where('members', 'array-contains', uid),
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


