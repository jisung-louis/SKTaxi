import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import type {PartyDetailResponseDto} from '../dto/taxiHomeDto';
import {mapPartyStatusDto} from './taxiPartyMapper';
import type {
  ChatMessageResponseDto,
  ChatRoomDetailResponseDto,
} from '../dto/taxiChatDto';
import type {
  TaxiChatSourceParticipant,
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

const resolveParticipantName = (
  party: PartyDetailResponseDto,
  participant: PartyDetailResponseDto['members'][number],
) => {
  const trimmedNickname = participant.nickname?.trim();

  if (trimmedNickname) {
    return trimmedNickname;
  }

  if (participant.isLeader) {
    return party.leaderName?.trim() || '방장';
  }

  return '동승 멤버';
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
}): TaxiChatSourceData => {
  const settlementByMemberId = new Map(
    (party.settlement?.memberSettlements ?? []).map(memberSettlement => [
      memberSettlement.memberId,
      memberSettlement,
    ]),
  );
  const participants: TaxiChatSourceParticipant[] = party.members.map(member => {
    const settlement = settlementByMemberId.get(member.id);

    return {
      id: member.id,
      isLeader: member.isLeader,
      name: resolveParticipantName(party, member),
      settled: settlement?.settled ?? false,
      settledAt: settlement?.settledAt ?? undefined,
    };
  });
  const memberCount = participants.length;

  return {
    composerPlaceholder: '메시지를 입력하세요',
    id: party.id,
    leaderId: party.leaderId,
    maxMembers: party.maxMembers,
    memberCount,
    notificationEnabled: !room.isMuted,
    participants,
    partyStatus: mapPartyStatusDto(party.status),
    settlement: party.settlement
      ? {
          perPersonAmount: party.settlement.perPersonAmount ?? 0,
          status:
            party.settlement.status === 'COMPLETED' ? 'completed' : 'pending',
        }
      : undefined,
    summary: {
      departureLabel: party.departure.name,
      departureTimeLabel: formatDepartureTimeLabel(party.departureTime),
      destinationLabel: party.destination.name,
      management: {
        canLeave: false,
        isLeader: false,
        memberActions: [],
        primaryActions: [],
        statusLabel: '',
        statusTone: mapPartyStatusDto(party.status),
      },
      memberSummaryLabel: `${memberCount}/${party.maxMembers}명`,
      tagLabel: party.tags?.[0] ?? '#택시팟',
    },
    title:
      room.name ||
      formatPartyTitle(party.departure.name, party.destination.name),
    messages: [...messages]
      .reverse()
      .map(mapTaxiChatMessageDto),
  };
};
