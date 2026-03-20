import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import type {PartyDetailResponseDto} from '../dto/taxiHomeDto';
import type {
  ChatMessageResponseDto,
  ChatRoomDetailResponseDto,
} from '../dto/taxiChatDto';
import type {
  TaxiChatSourceData,
  TaxiChatSourceMessageItem,
} from '../../model/taxiChatViewData';

const formatPartyTitle = (departureLabel: string, destinationLabel: string) =>
  `${departureLabel} → ${destinationLabel} 파티`;

const formatDepartureTimeLabel = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, 'M월 d일 a hh:mm', {locale: ko});
};

const resolveMessageText = (message: ChatMessageResponseDto) => {
  switch (message.type) {
    case 'IMAGE':
      return message.imageUrl ?? message.text ?? '이미지를 보냈어요.';
    case 'ACCOUNT':
    case 'ARRIVED':
    case 'END':
    case 'TEXT':
    case 'SYSTEM':
    default:
      return message.text ?? '';
  }
};

export const resolveTaxiChatRoomId = (partyId: string) => `party:${partyId}`;

export const mapTaxiChatMessageDto = (
  message: ChatMessageResponseDto,
): TaxiChatSourceMessageItem => ({
  createdAt: message.createdAt,
  id: message.id,
  senderId: message.senderId ?? 'system',
  senderName: message.senderName ?? '안내',
  text: resolveMessageText(message),
  type: message.type === 'SYSTEM' ? 'system' : 'text',
});

export const buildTaxiChatSourceData = ({
  messages,
  party,
  room,
}: {
  messages: ChatMessageResponseDto[];
  party: PartyDetailResponseDto;
  room: ChatRoomDetailResponseDto;
}): TaxiChatSourceData => ({
  composerPlaceholder: '메시지를 입력하세요',
  id: party.id,
  maxMembers: party.maxMembers,
  memberCount: room.memberCount,
  notificationEnabled: !room.isMuted,
  summary: {
    departureLabel: party.departure.name,
    departureTimeLabel: formatDepartureTimeLabel(party.departureTime),
    destinationLabel: party.destination.name,
    memberSummaryLabel: `${room.memberCount}/${party.maxMembers}명`,
    tagLabel: party.tags?.[0] ?? '#택시팟',
  },
  title:
    room.name ||
    formatPartyTitle(party.departure.name, party.destination.name),
  messages: [...messages]
    .reverse()
    .map(mapTaxiChatMessageDto),
});
