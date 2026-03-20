import type {
  JoinRequestListItemResponseDto,
  JoinRequestStatusDto,
  PartyDetailResponseDto,
  PartySettlementMemberResponseDto,
  PartyStatusDto,
  SettlementSummaryResponseDto,
} from '../dto/taxiHomeDto';
import type {
  JoinRequest,
  JoinRequestStatus,
  Party,
  PartySettlement,
  PartySettlementMember,
} from '../../model/types';

export const ACTIVE_PARTY_STATUSES: PartyStatusDto[] = [
  'OPEN',
  'CLOSED',
  'ARRIVED',
];

const normalizeDate = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate;
};

const normalizePartyTags = (tags?: string[] | null) =>
  tags?.map(tag => tag.trim()).filter(Boolean) ?? [];

const mapPartySettlementMember = (
  dto: PartySettlementMemberResponseDto,
): PartySettlementMember => ({
  settled: dto.settled,
  settledAt: normalizeDate(dto.settledAt),
});

const mapPartySettlement = (
  dto?: SettlementSummaryResponseDto | null,
): PartySettlement | undefined => {
  if (!dto) {
    return undefined;
  }

  return {
    members: (dto.memberSettlements ?? []).reduce<
      Record<string, PartySettlementMember>
    >((accumulator, memberSettlement) => {
      accumulator[memberSettlement.memberId] =
        mapPartySettlementMember(memberSettlement);
      return accumulator;
    }, {}),
    perPersonAmount: dto.perPersonAmount ?? 0,
    status: dto.status === 'COMPLETED' ? 'completed' : 'pending',
  };
};

export const isActivePartyStatusDto = (status: PartyStatusDto) =>
  ACTIVE_PARTY_STATUSES.includes(status);

export const mapPartyStatusDto = (status: PartyStatusDto): Party['status'] => {
  switch (status) {
    case 'OPEN':
      return 'open';
    case 'CLOSED':
      return 'closed';
    case 'ARRIVED':
      return 'arrived';
    case 'ENDED':
    default:
      return 'ended';
  }
};

export const mapJoinRequestStatusDto = (
  status: JoinRequestStatusDto,
): JoinRequest['status'] => {
  switch (status) {
    case 'ACCEPTED':
      return 'accepted';
    case 'DECLINED':
      return 'declined';
    case 'CANCELED':
      return 'canceled';
    case 'PENDING':
    default:
      return 'pending';
  }
};

export const mapPartyDetailResponseDtoToParty = (
  dto: PartyDetailResponseDto,
): Party => ({
  createdAt: normalizeDate(dto.createdAt),
  departure: {
    lat: dto.departure.lat,
    lng: dto.departure.lng,
    name: dto.departure.name,
  },
  departureTime: dto.departureTime,
  destination: {
    lat: dto.destination.lat,
    lng: dto.destination.lng,
    name: dto.destination.name,
  },
  detail: dto.detail ?? undefined,
  id: dto.id,
  leaderId: dto.leaderId,
  maxMembers: dto.maxMembers,
  members: dto.members.map(member => member.id),
  settlement: mapPartySettlement(dto.settlement),
  status: mapPartyStatusDto(dto.status),
  tags: normalizePartyTags(dto.tags),
});

export const mapJoinRequestListItemDtoToJoinRequest = ({
  dto,
  leaderId,
}: {
  dto: JoinRequestListItemResponseDto;
  leaderId: string;
}): JoinRequest => ({
  createdAt: normalizeDate(dto.createdAt),
  id: dto.id,
  leaderId,
  partyId: dto.partyId,
  requesterId: dto.requesterId,
  status: mapJoinRequestStatusDto(dto.status),
});

export const mapJoinRequestListItemDtoToStatus = (
  dto: JoinRequestListItemResponseDto,
): JoinRequestStatus => ({
  partyId: dto.partyId,
  requestId: dto.id,
  status: mapJoinRequestStatusDto(dto.status),
});
