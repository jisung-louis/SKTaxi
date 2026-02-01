// SKTaxi: 동승 요청 모달 관리 훅 (SRP 분리)
// RootNavigator에서 분리된 동승 요청 모달 상태 및 Firestore 구독

import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import firestore, { doc, getDoc, onSnapshot } from '@react-native-firebase/firestore';
import { acceptJoin, declineJoin, deleteJoinRequestNotifications } from '../../lib/notifications';

export interface JoinRequestData {
  requestId: string;
  partyId: string;
  requesterId: string;
}

export interface UseJoinRequestModalResult {
  joinData: JoinRequestData | null;
  setJoinData: React.Dispatch<React.SetStateAction<JoinRequestData | null>>;
  requesterName: string;
  handleAccept: () => Promise<void>;
  handleDecline: () => Promise<void>;
  handleRequestClose: () => void;
  // 알림 핸들러
  handleJoinRequestAccepted: (partyId: string) => void;
  handleJoinRequestRejected: () => void;
}

export function useJoinRequestModal(userId: string | undefined): UseJoinRequestModalResult {
  const navigation = useNavigation();
  const [joinData, setJoinData] = useState<JoinRequestData | null>(null);
  const [requesterName, setRequesterName] = useState<string>('');

  // 요청자 displayName 조회 (모달용)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!joinData?.requesterId) {
        setRequesterName('');
        return;
      }

      try {
        const snap = await getDoc(doc(firestore(), 'users', String(joinData.requesterId)));
        if (!cancelled) {
          setRequesterName((snap.data() as any)?.displayName || '익명');
        }
      } catch {
        if (!cancelled) {
          setRequesterName('익명');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [joinData?.requesterId]);

  // joinRequest 상태 실시간 구독 (취소 상태 감지)
  useEffect(() => {
    if (!joinData?.requestId) return;

    const requestDocRef = doc(firestore(), 'joinRequests', joinData.requestId);
    const unsubscribe = onSnapshot(requestDocRef, (snap) => {
      const data = snap.data();
      if (data?.status === 'canceled') {
        // 요청이 취소되면 모달 닫기
        setJoinData(null);
      }
    });

    return () => unsubscribe();
  }, [joinData?.requestId]);

  // 승인 핸들러
  const handleAccept = async () => {
    if (joinData && userId) {
      await acceptJoin(joinData.requestId, joinData.partyId, joinData.requesterId);
      // 리더(현재 사용자)의 동승 요청 알림 삭제
      await deleteJoinRequestNotifications(userId, joinData.partyId);
    }
    setJoinData(null);
  };

  // 거절 핸들러
  const handleDecline = async () => {
    if (joinData && userId) {
      await declineJoin(joinData.requestId);
      // 리더(현재 사용자)의 동승 요청 알림 삭제
      await deleteJoinRequestNotifications(userId, joinData.partyId);
    }
    setJoinData(null);
  };

  // 모달 닫기 핸들러
  const handleRequestClose = () => {
    setJoinData(null);
  };

  // 동승 요청 승인 알림 핸들러 (FCM)
  const handleJoinRequestAccepted = (partyId: string) => {
    (navigation as any).navigate('Main', {
      screen: '택시',
      params: {
        screen: 'Chat',
        params: { partyId },
      },
    });
  };

  // 동승 요청 거절 알림 핸들러 (FCM)
  const handleJoinRequestRejected = () => {
    // AcceptancePendingScreen에서 이미 Alert를 표시하므로 여기서는 네비게이션만 처리
    (navigation as any).popToTop();
  };

  return {
    joinData,
    setJoinData,
    requesterName,
    handleAccept,
    handleDecline,
    handleRequestClose,
    handleJoinRequestAccepted,
    handleJoinRequestRejected,
  };
}
