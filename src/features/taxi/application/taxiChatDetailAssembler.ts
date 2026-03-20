import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {COLORS} from '@/shared/design-system/tokens';
import type {
  ChatThreadHeaderViewData,
  ChatThreadItemViewData,
} from '@/shared/ui/chat';

import {
  TAXI_CHAT_CURRENT_USER_ID,
  type TaxiChatSourceData,
  type TaxiChatViewData,
} from '../model/taxiChatViewData';

const buildHeader = (
  partyChat: TaxiChatSourceData,
): ChatThreadHeaderViewData => ({
  iconBackgroundColor: COLORS.accent.yellowSoft,
  iconColor: COLORS.accent.yellow,
  iconName: 'car-sport-outline',
  subtitle: `${partyChat.memberCount}명`,
  title: partyChat.title,
});

const buildItems = (partyChat: TaxiChatSourceData, currentUserId: string) => {
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
          : message.senderId === currentUserId
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

export const buildTaxiChatViewData = ({
  currentUserId = TAXI_CHAT_CURRENT_USER_ID,
  partyChat,
}: {
  currentUserId?: string;
  partyChat: TaxiChatSourceData;
}): TaxiChatViewData => ({
  composerPlaceholder: partyChat.composerPlaceholder,
  currentUserId,
  header: buildHeader(partyChat),
  items: buildItems(partyChat, currentUserId),
  menu: {
    leaveLabel: '채팅방 나가기',
    notificationEnabled: partyChat.notificationEnabled,
  },
  roomId: partyChat.id,
  summary: partyChat.summary,
});
