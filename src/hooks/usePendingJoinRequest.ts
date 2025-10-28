import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore, { collection, query, where, onSnapshot, limit } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

// SKTaxi: 현재 사용자의 pending 동승 요청 조회 훅
export function usePendingJoinRequest() {
  const [pendingRequest, setPendingRequest] = useState<{
    partyId: string | null;
    requestId: string | null;
  }>({
    partyId: null,
    requestId: null,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const user = auth(getApp()).currentUser;
    
    if (!user) {
      setPendingRequest({ partyId: null, requestId: null });
      setLoading(false);
      return;
    }

    setLoading(true);

    // SKTaxi: 현재 사용자의 pending 요청 조회
    const q = query(
      collection(firestore(getApp()), 'joinRequests'),
      where('requesterId', '==', user.uid),
      where('status', '==', 'pending'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setPendingRequest({ partyId: null, requestId: null });
        } else {
          const requestData = snap.docs[0].data();
          setPendingRequest({
            partyId: requestData.partyId as string,
            requestId: snap.docs[0].id,
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Pending join request subscription error:', error);
        setPendingRequest({ partyId: null, requestId: null });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { pendingRequest, loading };
}
