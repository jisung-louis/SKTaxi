import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {taxiHomeApiClient} from '../data/api/taxiHomeApiClient';
import type {
  MyPartyResponseDto,
  PartyStatusDto,
  PartySummaryResponseDto,
} from '../data/dto/taxiHomeDto';
import type {
  TaxiHomeAvatarViewData,
  TaxiHomeFilterDefinition,
  TaxiHomePartyCardViewData,
  TaxiHomeSortDefinition,
  TaxiHomeSourceData,
} from '../model/taxiHomeViewData';

const AVATAR_PALETTE = [
  {backgroundColor: '#E5E7EB', textColor: '#111827'},
  {backgroundColor: '#FDE68A', textColor: '#111827'},
  {backgroundColor: '#BFDBFE', textColor: '#1E3A8A'},
  {backgroundColor: '#D1FAE5', textColor: '#065F46'},
  {backgroundColor: '#FBCFE8', textColor: '#9D174D'},
  {backgroundColor: '#DDD6FE', textColor: '#5B21B6'},
] as const;

const TAXI_HOME_FILTERS: TaxiHomeFilterDefinition[] = [
  {
    id: 'all',
    label: '전체',
    matchKeywords: ['전체'],
  },
  {
    id: 'anyang',
    label: '안양역',
    matchKeywords: ['안양역', 'anyang'],
  },
  {
    id: 'beomgye',
    label: '범계역',
    matchKeywords: ['범계역', 'beomgye'],
  },
];

const TAXI_HOME_SORTS: TaxiHomeSortDefinition[] = [
  {
    id: 'latest',
    label: '최신순',
  },
  {
    id: 'departureSoon',
    label: '출발임박순',
  },
];

const ACTIVE_MY_PARTY_STATUSES: PartyStatusDto[] = ['OPEN', 'CLOSED', 'ARRIVED'];

const hashSeed = (value: string) =>
  Array.from(value).reduce(
    (seed, character) => seed + character.charCodeAt(0),
    0,
  );

const buildAvatar = (
  id: string,
  label: string,
  seedValue: string,
): TaxiHomeAvatarViewData => {
  const palette = AVATAR_PALETTE[hashSeed(seedValue) % AVATAR_PALETTE.length];

  return {
    backgroundColor: palette.backgroundColor,
    id,
    label: label.slice(0, 1) || '?',
    textColor: palette.textColor,
  };
};

const formatDepartureTimeLabel = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, 'a hh:mm', {locale: ko});
};

const buildFilterIds = (departureLabel: string) => {
  const normalizedDeparture = departureLabel.toLowerCase();
  const filterIds: TaxiHomePartyCardViewData['filterIds'] = ['all'];

  if (
    departureLabel.includes('안양') ||
    normalizedDeparture.includes('anyang')
  ) {
    filterIds.push('anyang');
  }

  if (
    departureLabel.includes('범계') ||
    normalizedDeparture.includes('beomgye')
  ) {
    filterIds.push('beomgye');
  }

  return filterIds;
};

const buildStatusMeta = (status: PartyStatusDto) => {
  switch (status) {
    case 'OPEN':
      return {
        label: '모집중',
        tone: 'active' as const,
      };
    case 'CLOSED':
      return {
        label: '마감',
        tone: 'inactive' as const,
      };
    case 'ARRIVED':
      return {
        label: '도착',
        tone: 'inactive' as const,
      };
    case 'ENDED':
    default:
      return {
        label: '종료',
        tone: 'inactive' as const,
      };
  }
};

const buildParticipantAvatars = (
  party: PartySummaryResponseDto,
): TaxiHomeAvatarViewData[] => {
  const participantCount = Math.max(Math.min(party.currentMembers - 1, 3), 0);

  return Array.from({length: participantCount}, (_, index) =>
    buildAvatar(
      `${party.id}-member-${index + 1}`,
      `${index + 1}`,
      `${party.id}-member-${index + 1}`,
    ),
  );
};

const buildJoinAction = (
  partyId: string,
  activePartyId: string | null,
): TaxiHomePartyCardViewData['joinAction'] => {
  if (activePartyId === partyId) {
    return {
      helperText: '현재 내가 참여 중인 파티예요',
      label: '내가 참여중인 파티',
      state: 'joined',
    };
  }

  if (activePartyId) {
    return {
      helperText: '기존 파티 종료 후 다시 요청할 수 있어요',
      label: '동승 요청하기',
      state: 'blocked-by-other-party',
    };
  }

  return {
    helperText: '실제 동승 요청 연결은 다음 단계에서 이어집니다',
    label: '동승 요청 준비중',
    state: 'request',
  };
};

const buildPartyCard = (
  party: PartySummaryResponseDto,
  activePartyId: string | null,
): TaxiHomePartyCardViewData => {
  const statusMeta = buildStatusMeta(party.status);
  const departureTimeLabel = formatDepartureTimeLabel(party.departureTime);
  const leaderName = party.leaderName?.trim() || '파티장';

  return {
    action: {
      type: activePartyId === party.id ? 'open-chat' : 'preview',
    },
    createdAt: party.createdAt,
    departureAt: party.departureTime,
    departureLabel: party.departure.name,
    departureTimeLabel,
    destinationLabel: party.destination.name,
    estimatedFareLabel: '미정',
    filterIds: buildFilterIds(party.departure.name),
    id: party.id,
    joinAction: buildJoinAction(party.id, activePartyId),
    leaderAvatar: buildAvatar(party.leaderId, leaderName, party.leaderId),
    leaderName,
    leaderRoleLabel: '파티장',
    memberSummaryLabel: `${party.currentMembers}/${party.maxMembers}명`,
    participantAvatars: buildParticipantAvatars(party),
    searchKeywords: [
      party.departure.name,
      party.destination.name,
      leaderName,
      departureTimeLabel,
      ...(party.tags ?? []),
    ].filter(Boolean),
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
  };
};

const buildTaxiHomeSourceData = (
  parties: PartySummaryResponseDto[],
  activePartyId: string | null,
): TaxiHomeSourceData => {
  return {
    emptyState: {
      description: '검색어를 지우거나 다른 출발지 필터를 선택해보세요.',
      title: '조건에 맞는 파티가 없습니다',
    },
    filters: TAXI_HOME_FILTERS,
    liveChatActionLabel: '파티 채팅 가기',
    parties: parties.map(party => buildPartyCard(party, activePartyId)),
    primaryActionLabel: '새 파티 만들기',
    searchPlaceholder: '출발지 검색',
    sectionTitle: '모집 중인 파티',
    sortOptions: TAXI_HOME_SORTS,
  };
};

export interface TaxiHomeQueryResult {
  activePartyId: string | null;
  hasActiveParty: boolean;
  source: TaxiHomeSourceData;
}

export async function loadTaxiHomeQueryResult(): Promise<TaxiHomeQueryResult> {
  const [partiesResponse, myPartiesResponse] = await Promise.all([
    taxiHomeApiClient.getOpenParties(),
    taxiHomeApiClient.getMyParties().catch(() => ({
      data: [] as MyPartyResponseDto[],
      success: true,
    })),
  ]);

  const activeParty =
    myPartiesResponse.data.find(party =>
      ACTIVE_MY_PARTY_STATUSES.includes(party.status),
    ) ?? null;
  const activePartyId = activeParty?.id ?? null;

  return {
    activePartyId,
    hasActiveParty: Boolean(activePartyId),
    source: buildTaxiHomeSourceData(
      partiesResponse.data.content,
      activePartyId,
    ),
  };
}
