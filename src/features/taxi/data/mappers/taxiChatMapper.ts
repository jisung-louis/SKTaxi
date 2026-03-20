import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import type {PartyDetailResponseDto} from '../dto/taxiHomeDto';
import {mapPartyStatusDto} from './taxiPartyMapper';
import type {
  ChatAccountDataResponseDto,
  ChatArrivalDataResponseDto,
  ChatMessageResponseDto,
  ChatRoomDetailResponseDto,
} from '../dto/taxiChatDto';
import type {
  TaxiChatSourceAccountData,
  TaxiChatSourceArrivalData,
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

const mapAccountData = (
  accountData?: ChatAccountDataResponseDto | null,
): TaxiChatSourceAccountData | undefined => {
  if (!accountData) {
    return undefined;
  }

  return {
    accountHolder: accountData.accountHolder,
    accountNumber: accountData.accountNumber,
    bankName: accountData.bankName,
  };
};

const mapArrivalData = (
  arrivalData?: ChatArrivalDataResponseDto | null,
): TaxiChatSourceArrivalData | undefined => {
  if (!arrivalData) {
    return undefined;
  }

  return {
    memberCount: arrivalData.memberCount ?? undefined,
    perPerson: arrivalData.perPerson ?? undefined,
    taxiFare: arrivalData.taxiFare ?? undefined,
  };
};

const resolveMessageType = (
  message: ChatMessageResponseDto,
): TaxiChatSourceMessageItem['type'] => {
  switch (message.type) {
    case 'ACCOUNT':
      return 'account';
    case 'ARRIVED':
      return 'arrived';
    case 'END':
      return 'end';
    case 'SYSTEM':
      return 'system';
    case 'IMAGE':
    case 'TEXT':
    default:
      return 'text';
  }
};

const resolveMessageText = (message: ChatMessageResponseDto) => {
  switch (message.type) {
    case 'IMAGE':
      return message.imageUrl ?? message.text ?? '이미지를 보냈어요.';
    case 'ACCOUNT':
      return (
        message.text ??
        (message.accountData
          ? `${message.accountData.bankName} ${message.accountData.accountNumber}`
          : '계좌 정보를 보냈어요.')
      );
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
  accountData: mapAccountData(message.accountData),
  arrivalData: mapArrivalData(message.arrivalData),
  createdAt: message.createdAt,
  id: message.id,
  senderId: message.senderId ?? 'system',
  senderName: message.senderName ?? '안내',
  text: resolveMessageText(message),
  type: resolveMessageType(message),
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
  const mappedMessages = [...messages].reverse().map(mapTaxiChatMessageDto);
  const latestAccountData =
    [...mappedMessages]
      .reverse()
      .find(message => message.type === 'account' && message.accountData)
      ?.accountData ?? undefined;

  return {
    composerPlaceholder: '메시지를 입력하세요',
    departureLocation: {
      lat: party.departure.lat,
      lng: party.departure.lng,
      name: party.departure.name,
    },
    departureTimeISO: party.departureTime,
    detail: party.detail ?? undefined,
    destinationLocation: {
      lat: party.destination.lat,
      lng: party.destination.lng,
      name: party.destination.name,
    },
    id: party.id,
    latestAccountData,
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
    tagLabel: party.tags?.[0] ?? '#택시팟',
    title:
      room.name ||
      formatPartyTitle(party.departure.name, party.destination.name),
    messages: mappedMessages,
  };
};

export const formatTaxiChatDepartureTime = (value: string) =>
  formatDepartureTimeLabel(value);
