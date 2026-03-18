import React from 'react';
import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {
  COLORS,
} from '@/shared/design-system/tokens';
import type {
  ChatThreadHeaderViewData,
  ChatThreadItemViewData,
} from '@/shared/ui/chat';

import {
  TAXI_CHAT_CURRENT_USER_ID,
  type TaxiChatSourceData,
  type TaxiChatViewData,
} from '../model/taxiChatViewData';
import {taxiChatRepository} from '../data/repositories/taxiChatRepository';

const buildHeader = (
  partyChat: TaxiChatSourceData,
): ChatThreadHeaderViewData => ({
  iconBackgroundColor: COLORS.accent.yellowSoft,
  iconColor: COLORS.accent.yellow,
  iconName: 'car-sport-outline',
  subtitle: `${partyChat.memberCount}명`,
  title: partyChat.title,
});

const buildItems = (partyChat: TaxiChatSourceData): ChatThreadItemViewData[] => {
  const items: ChatThreadItemViewData[] = [];
  let previousDateKey: string | null = null;

  partyChat.messages.forEach(message => {
    const createdDate = new Date(message.createdAt);
    const dateKey = format(createdDate, 'yyyy-MM-dd');

    if (dateKey !== previousDateKey) {
      items.push({
        id: `${partyChat.id}-${dateKey}`,
        label: format(createdDate, 'yyyy년 M월 d일 EEEE', {locale: ko}),
        type: 'date-divider',
      });
      previousDateKey = dateKey;
    }

    items.push({
      avatar: message.avatar,
      direction:
        message.type === 'system'
          ? 'system'
          : message.senderId === TAXI_CHAT_CURRENT_USER_ID
          ? 'outgoing'
          : 'incoming',
      id: message.id,
      minuteKey: format(createdDate, 'yyyy-MM-dd HH:mm'),
      senderId: message.senderId,
      senderName: message.senderName,
      text: message.text,
      timeLabel: format(createdDate, 'a hh:mm', {locale: ko}),
      type: 'message',
    });
  });

  return items;
};

const buildViewData = (partyChat: TaxiChatSourceData): TaxiChatViewData => ({
  composerPlaceholder: partyChat.composerPlaceholder,
  currentUserId: TAXI_CHAT_CURRENT_USER_ID,
  header: buildHeader(partyChat),
  items: buildItems(partyChat),
  menu: {
    leaveLabel: '채팅방 나가기',
    notificationEnabled: partyChat.notificationEnabled,
  },
  roomId: partyChat.id,
  summary: partyChat.summary,
});

export const useTaxiChatDetailData = (partyId: string | undefined) => {
  const [data, setData] = React.useState<TaxiChatViewData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
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

      setData(buildViewData(partyChat));
      await taxiChatRepository.setCurrentParty(partyId);
    } catch (loadError) {
      console.error('파티 채팅 데이터를 불러오지 못했습니다.', loadError);
      setError('파티 채팅 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const leaveParty = React.useCallback(async () => {
    if (!partyId) {
      return;
    }

    await taxiChatRepository.leaveParty(partyId);
  }, [partyId]);

  const sendMessage = React.useCallback(
    async (messageText: string) => {
      if (!partyId) {
        return;
      }

      const nextPartyChat = await taxiChatRepository.sendMessage(
        partyId,
        messageText,
      );

      if (!nextPartyChat) {
        return;
      }

      setData(buildViewData(nextPartyChat));
    },
    [partyId],
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

    setData(buildViewData(nextPartyChat));
  }, [data, partyId]);

  return {
    data,
    error,
    leaveParty,
    loading,
    reload: load,
    sendMessage,
    toggleNotification,
  };
};
