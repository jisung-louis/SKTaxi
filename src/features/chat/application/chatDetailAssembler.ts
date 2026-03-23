import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {COLORS} from '@/shared/design-system/tokens';
import type {
  ChatThreadHeaderViewData,
  ChatThreadItemViewData,
} from '@/shared/ui/chat';

import type {ChatDetailViewData} from '../model/chatDetailViewData';
import type {ChatMessage, ChatRoom} from '../model/types';

const buildHeader = (
  room: ChatRoom,
): ChatThreadHeaderViewData => {
  if (room.type === 'university') {
    return {
      iconBackgroundColor: COLORS.brand.primarySoft,
      iconColor: COLORS.brand.primary,
      iconName: 'business-outline',
      subtitle: `${room.memberCount.toLocaleString('ko-KR')}명`,
      title: room.name,
    };
  }

  if (room.type === 'department') {
    return {
      iconBackgroundColor: COLORS.accent.blueSoft,
      iconColor: COLORS.accent.blue,
      iconName: 'people-outline',
      subtitle: `${room.memberCount.toLocaleString('ko-KR')}명`,
      title: room.name,
    };
  }

  if (room.type === 'game') {
    return {
      iconBackgroundColor: COLORS.accent.orangeSoft,
      iconColor: COLORS.accent.orange,
      iconName: 'game-controller-outline',
      subtitle: `${room.memberCount.toLocaleString('ko-KR')}명`,
      title: room.name,
    };
  }

  return {
    iconBackgroundColor: COLORS.accent.purpleSoft,
    iconColor: COLORS.accent.purple,
    iconName: 'chatbubble-outline',
    subtitle: `${room.memberCount.toLocaleString('ko-KR')}명`,
    title: room.name,
  };
};

const buildItems = (
  messages: ChatMessage[],
  currentUserId: string,
  roomId: string,
): ChatThreadItemViewData[] => {
  const items: ChatThreadItemViewData[] = [];
  let previousDateKey: string | null = null;

  messages.forEach(message => {
    const createdDate = new Date(String(message.createdAt));
    const createdAtMillis = createdDate.getTime();

    if (Number.isNaN(createdAtMillis)) {
      return;
    }

    const dateKey = format(createdDate, 'yyyy-MM-dd');

    if (dateKey !== previousDateKey) {
      items.push({
        id: `${roomId}-${dateKey}`,
        label: format(createdDate, 'yyyy년 M월 d일 EEEE', {locale: ko}),
        type: 'date-divider',
      });
      previousDateKey = dateKey;
    }

    items.push({
      direction:
        message.type === 'system'
          ? 'system'
          : message.senderId === currentUserId
          ? 'outgoing'
          : 'incoming',
      id: message.id ?? `${roomId}-${createdDate.toISOString()}`,
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

export const buildChatDetailViewData = ({
  currentUserId,
  messages,
  room,
}: {
  currentUserId: string;
  messages: ChatMessage[];
  room: ChatRoom;
}): ChatDetailViewData => ({
  composerPlaceholder: '메시지를 입력하세요',
  currentUserId,
  header: buildHeader(room),
  items: buildItems(messages, currentUserId, room.id ?? room.name),
  menu: {
    canReport: true,
    leaveLabel: '채팅방 나가기',
    notificationEnabled: room.isMuted !== true,
  },
  roomId: room.id ?? room.name,
});
