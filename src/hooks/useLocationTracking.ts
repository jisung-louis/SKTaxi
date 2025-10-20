import { useEffect } from 'react';
import { useAuth } from './useAuth';
import firestore, { doc, setDoc, deleteDoc } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { useMyParty } from './useMyParty';

interface Location {
  latitude: number;
  longitude: number;
}

export const useLocationTracking = (location: Location | null, isLocationValid: boolean) => {
  const { user } = useAuth();
  const { hasParty, partyId } = useMyParty();

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    // 파티에 속해있지 않으면 위치 정보 삭제
    if (!hasParty || !partyId) {
      const deleteLocation = async () => {
        try {
          await deleteDoc(doc(firestore(getApp()), 'userLocations', user.uid));
          console.log('파티를 나가서 위치 정보 삭제됨');
        } catch (error) {
          console.error('위치 정보 삭제 실패:', error);
        }
      };
      deleteLocation();
      return;
    }

    // 위치가 유효하지 않으면 위치 정보 삭제
    if (!isLocationValid || !location) {
      const deleteLocation = async () => {
        try {
          await deleteDoc(doc(firestore(getApp()), 'userLocations', user.uid));
          console.log('위치가 유효하지 않아서 위치 정보 삭제됨');
        } catch (error) {
          console.error('위치 정보 삭제 실패:', error);
        }
      };
      deleteLocation();
      return;
    }

    // 10초마다 위치 업데이트
    const updateLocation = async () => {
      try {
        await setDoc(doc(firestore(getApp()), 'userLocations', user.uid), {
          partyId: partyId,
          displayName: user.displayName || '익명',
          latitude: location.latitude,
          longitude: location.longitude,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error('위치 업데이트 실패:', error);
      }
    };

    // 즉시 업데이트
    updateLocation();

    // 10초마다 업데이트
    const interval = setInterval(updateLocation, 10 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.uid, isLocationValid, location, hasParty, partyId]);
};
