import React from 'react';
import {useTaxiChatRepository} from '@/di/useRepository';
import {useAuth} from '@/features/auth';

import {
  TAXI_CHAT_CURRENT_USER_ID,
  type TaxiChatSourceData,
  type TaxiChatViewData,
} from '../model/taxiChatViewData';
import {buildTaxiChatViewData} from '../application/taxiChatDetailAssembler';

export const useTaxiChatDetailData = (partyId: string | undefined) => {
  const taxiChatRepository = useTaxiChatRepository();
  const {user} = useAuth();
  const [data, setData] = React.useState<TaxiChatViewData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const hasDataRef = React.useRef(false);

  React.useEffect(() => {
    hasDataRef.current = data !== null;
  }, [data]);

  const applyPartyChat = React.useCallback(
    (partyChat: TaxiChatSourceData) => {
      setData(
        buildTaxiChatViewData({
          currentUserId: user?.uid ?? TAXI_CHAT_CURRENT_USER_ID,
          partyChat,
        }),
      );
      setError(null);
    },
    [user?.uid],
  );

  const reload = React.useCallback(async () => {
    if (!partyId) {
      setData(null);
      setError('파티 채팅방 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const partyChat = await taxiChatRepository.getPartyChat(partyId);

      if (!partyChat) {
        setData(null);
        setError('파티 채팅방 정보를 찾을 수 없습니다.');
        return;
      }

      applyPartyChat(partyChat);
      await taxiChatRepository.setCurrentParty(partyId);
    } catch (loadError) {
      console.error('파티 채팅 데이터를 불러오지 못했습니다.', loadError);
      setError('파티 채팅 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [applyPartyChat, partyId, taxiChatRepository]);

  React.useEffect(() => {
    if (!partyId) {
      setData(null);
      setError('파티 채팅방 정보를 찾을 수 없습니다.');
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = taxiChatRepository.subscribeToPartyChat(partyId, {
      onData: partyChat => {
        if (!partyChat) {
          setData(null);
          setError('파티 채팅방 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        applyPartyChat(partyChat);
        setLoading(false);
      },
      onError: loadError => {
        console.error('파티 채팅 실시간 연결에 실패했습니다.', loadError);

        if (!hasDataRef.current) {
          setError('파티 채팅 데이터를 불러오지 못했습니다.');
        }

        setLoading(false);
      },
    });

    taxiChatRepository.setCurrentParty(partyId).catch(() => undefined);

    return () => unsubscribe();
  }, [applyPartyChat, partyId, taxiChatRepository]);

  const leaveParty = React.useCallback(async () => {
    if (!partyId) {
      return;
    }

    await taxiChatRepository.leaveParty(partyId);
  }, [partyId, taxiChatRepository]);

  const sendMessage = React.useCallback(
    async (messageText: string) => {
      if (!partyId) {
        return;
      }

      await taxiChatRepository.sendMessage(partyId, messageText);
    },
    [partyId, taxiChatRepository],
  );

  const toggleNotification = React.useCallback(async () => {
    if (!partyId || !data) {
      return;
    }

    const nextPartyChat = await taxiChatRepository.updateNotificationSetting(
      partyId,
      !data.menu.notificationEnabled,
    );

    if (!nextPartyChat) {
      return;
    }

    applyPartyChat(nextPartyChat);
  }, [applyPartyChat, data, partyId, taxiChatRepository]);

  return {
    data,
    error,
    leaveParty,
    loading,
    reload,
    sendMessage,
    toggleNotification,
  };
};
