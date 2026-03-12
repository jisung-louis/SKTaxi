import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUserDisplayNames } from '@/features/user';

import { acceptJoinRequest, declineJoinRequest } from '../services/joinRequestService';
import { useJoinRequestStatus } from './useJoinRequestStatus';
import { useNotificationActionRepository } from './useNotificationActionRepository';
import { usePartyRepository } from './usePartyRepository';

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
  const partyRepository = usePartyRepository();
  const notificationActionRepository = useNotificationActionRepository();
  const { requestStatus } = useJoinRequestStatus(joinData?.requestId);
  const { displayNameMap } = useUserDisplayNames(
    joinData?.requesterId ? [joinData.requesterId] : [],
  );
  const requesterName = joinData?.requesterId
    ? displayNameMap[joinData.requesterId] || '익명'
    : '';

  useEffect(() => {
    if (requestStatus?.status === 'canceled') {
      setJoinData(null);
    }
  }, [requestStatus?.status]);

  // 승인 핸들러
  const handleAccept = async () => {
    if (joinData && userId) {
      await acceptJoinRequest({
        partyRepository,
        notificationActionRepository,
        leaderId: userId,
        partyId: joinData.partyId,
        requestId: joinData.requestId,
        requesterId: joinData.requesterId,
        requesterName,
      });
    }
    setJoinData(null);
  };

  // 거절 핸들러
  const handleDecline = async () => {
    if (joinData && userId) {
      await declineJoinRequest({
        partyRepository,
        notificationActionRepository,
        leaderId: userId,
        partyId: joinData.partyId,
        requestId: joinData.requestId,
      });
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
