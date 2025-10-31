import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import firestore, { collection, query, where, onSnapshot } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

interface JoinRequestContextType {
  joinRequestCount: number;
}

const JoinRequestContext = createContext<JoinRequestContextType | undefined>(undefined);

export const useJoinRequestCount = () => {
  const context = useContext(JoinRequestContext);
  if (!context) {
    throw new Error('useJoinRequestCount must be used within a JoinRequestProvider');
  }
  return context;
};

export const JoinRequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [joinRequestCount, setJoinRequestCount] = useState(0);
  const { user } = useAuth();


  useEffect(() => {
    if (!user?.uid) {
      setJoinRequestCount(0);
      return;
    }

    let unsubscribeParties: (() => void) | undefined;
    let unsubscribeJoinRequests: (() => void) | undefined;

    // 사용자가 리더인 파티들의 ID를 가져와서 동승 요청 개수 조회
    const partiesQuery = query(
      collection(firestore(getApp()), 'parties'),
      where('leaderId', '==', user.uid)
    );

    unsubscribeParties = onSnapshot(partiesQuery, (partiesSnapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      if (partiesSnapshot.empty) {
        setJoinRequestCount(0);
        return;
      }

      const partyIds = partiesSnapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => docSnap.id);
      
      // 모든 파티의 동승 요청을 한 번에 조회
      if (partyIds.length === 0) {
        setJoinRequestCount(0);
        return;
      }

      const joinRequestsQuery = query(
        collection(firestore(getApp()), 'joinRequests'),
        where('partyId', 'in', partyIds),
        where('status', '==', 'pending')
      );

      unsubscribeJoinRequests = onSnapshot(joinRequestsQuery, (joinRequestsSnapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        setJoinRequestCount(joinRequestsSnapshot.size);
      }, (error) => {
        console.error('동승 요청 개수 조회 실패:', error);
        setJoinRequestCount(0);
      });
    }, (error) => {
      console.error('파티 조회 실패:', error);
      setJoinRequestCount(0);
    });

    return () => {
      if (unsubscribeParties) unsubscribeParties();
      if (unsubscribeJoinRequests) unsubscribeJoinRequests();
    };
  }, [user?.uid]);

  return (
    <JoinRequestContext.Provider value={{ joinRequestCount }}>
      {children}
    </JoinRequestContext.Provider>
  );
};
