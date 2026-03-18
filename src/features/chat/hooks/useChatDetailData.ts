import React from 'react';
import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {V2_COLORS} from '@/shared/design-system/tokens';
import type {
  ChatThreadHeaderViewData,
  ChatThreadItemViewData,
} from '@/shared/ui/chat';

import {
  CHAT_DETAIL_CURRENT_USER_ID,
  type ChatDetailSourceData,
  type ChatDetailViewData,
} from '../model/chatDetailViewData';
import {chatDetailRepository} from '../data/repositories/chatDetailRepository';

const buildHeader = (
  roomDetail: ChatDetailSourceData,
): ChatThreadHeaderViewData => {
  if (roomDetail.roomType === 'university') {
    return {
      iconBackgroundColor: V2_COLORS.brand.primarySoft,
      iconColor: V2_COLORS.brand.primary,
      iconName: 'business-outline',
      subtitle: `${roomDetail.memberCount.toLocaleString('ko-KR')}명`,
      title: roomDetail.title,
    };
  }

  if (roomDetail.roomType === 'department') {
    return {
      iconBackgroundColor: V2_COLORS.accent.blueSoft,
      iconColor: V2_COLORS.accent.blue,
      iconName: 'people-outline',
      subtitle: `${roomDetail.memberCount.toLocaleString('ko-KR')}명`,
      title: roomDetail.title,
    };
  }

  if (roomDetail.roomType === 'game') {
    return {
      iconBackgroundColor: V2_COLORS.accent.orangeSoft,
      iconColor: V2_COLORS.accent.orange,
      iconName: 'game-controller-outline',
      subtitle: `${roomDetail.memberCount.toLocaleString('ko-KR')}명`,
      title: roomDetail.title,
    };
  }

  return {
    iconBackgroundColor: V2_COLORS.accent.purpleSoft,
    iconColor: V2_COLORS.accent.purple,
    iconName: 'chatbubble-outline',
    subtitle: `${roomDetail.memberCount.toLocaleString('ko-KR')}명`,
    title: roomDetail.title,
  };
};

const buildItems = (
  roomDetail: ChatDetailSourceData,
): ChatThreadItemViewData[] => {
  const items: ChatThreadItemViewData[] = [];
  let previousDateKey: string | null = null;

  roomDetail.messages.forEach(message => {
    const createdDate = new Date(message.createdAt);
    const dateKey = format(createdDate, 'yyyy-MM-dd');

    if (dateKey !== previousDateKey) {
      items.push({
        id: `${roomDetail.id}-${dateKey}`,
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
          : message.senderId === CHAT_DETAIL_CURRENT_USER_ID
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

const buildViewData = (
  roomDetail: ChatDetailSourceData,
): ChatDetailViewData => ({
  composerPlaceholder: roomDetail.composerPlaceholder,
  currentUserId: CHAT_DETAIL_CURRENT_USER_ID,
  header: buildHeader(roomDetail),
  items: buildItems(roomDetail),
  menu: {
    canReport: true,
    leaveLabel: '채팅방 나가기',
    notificationEnabled: roomDetail.notificationEnabled,
  },
  roomId: roomDetail.id,
});

export const useChatDetailData = (chatRoomId: string | undefined) => {
  const [data, setData] = React.useState<ChatDetailViewData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!chatRoomId) {
      setData(null);
      setError(null);
      setLoading(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const roomDetail = await chatDetailRepository.getRoomDetail(chatRoomId);

      if (!roomDetail) {
        setData(null);
        setNotFound(true);
        return;
      }

      setData(buildViewData(roomDetail));
    } catch (loadError) {
      console.error('채팅 상세 데이터를 불러오지 못했습니다.', loadError);
      setError('채팅 상세 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [chatRoomId]);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const sendMessage = React.useCallback(
    async (messageText: string) => {
      if (!chatRoomId) {
        return;
      }

      const nextRoomDetail = await chatDetailRepository.sendMessage(
        chatRoomId,
        messageText,
      );

      if (!nextRoomDetail) {
        return;
      }

      setData(buildViewData(nextRoomDetail));
    },
    [chatRoomId],
  );

  const toggleNotification = React.useCallback(async () => {
    if (!chatRoomId || !data) {
      return;
    }

    const nextRoomDetail = await chatDetailRepository.updateNotificationSetting(
      chatRoomId,
      !data.menu.notificationEnabled,
    );

    if (!nextRoomDetail) {
      return;
    }

    setData(buildViewData(nextRoomDetail));
  }, [chatRoomId, data]);

  return {
    data,
    error,
    loading,
    notFound,
    reload: load,
    sendMessage,
    toggleNotification,
  };
};
