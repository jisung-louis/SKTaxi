import { useState, useEffect } from 'react';
import firestore, { collection, query, where, onSnapshot, Timestamp } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

interface MemberLocation {
  userId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  lastUpdated: Date;
}

export const usePartyMemberLocations = (partyId: string | null) => {
  const [memberLocations, setMemberLocations] = useState<MemberLocation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!partyId) {
      setMemberLocations([]);
      return;
    }

    setLoading(true);

    // 5분 이내의 위치 정보만 가져오기
    const fiveMinutesAgo = Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000));
    
    // 파티 멤버들의 위치 정보를 실시간으로 구독
    const locationsQuery = query(
      collection(firestore(getApp()), 'userLocations'),
      where('partyId', '==', partyId),
      where('lastUpdated', '>=', fiveMinutesAgo)
    );

    const unsubscribe = onSnapshot(locationsQuery, (snapshot) => {
      try {
        const locations: MemberLocation[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            userId: doc.id,
            displayName: data.displayName || '익명',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            lastUpdated: data.lastUpdated?.toDate() || new Date(),
          };
        }).filter(location => 
          location.latitude !== 0 && 
          location.longitude !== 0
        );

        setMemberLocations(locations);
      } catch (error) {
        console.error('파티원 위치 정보 조회 실패:', error);
        setMemberLocations([]);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('파티원 위치 구독 실패:', error);
      setMemberLocations([]);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [partyId]);

  return { memberLocations, loading };
};
