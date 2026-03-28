import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {COLORS} from '@/shared/design-system/tokens';
import {RepositoryError, RepositoryErrorCode} from '@/shared/lib/errors';

import {taxiHomeApiClient} from '../data/api/taxiHomeApiClient';
import type {
  JoinRequestListItemResponseDto,
  PartyParticipantSummaryResponseDto,
  PartyStatusDto,
  PartySummaryResponseDto,
} from '../data/dto/taxiHomeDto';
import type {
  TaxiAcceptancePendingAvatarViewData,
  TaxiAcceptancePendingSeed,
} from '../model/taxiAcceptancePendingViewData';
import type {
  TaxiHomeAvatarViewData,
  TaxiHomeFilterDefinition,
  TaxiHomePartyCardViewData,
  TaxiHomeSortDefinition,
  TaxiHomeSourceData,
} from '../model/taxiHomeViewData';

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
const PERSONAL_STATE_FALLBACK_ERROR_CODES = new Set<RepositoryErrorCode>([
  RepositoryErrorCode.NETWORK_ERROR,
  RepositoryErrorCode.TIMEOUT,
  RepositoryErrorCode.RATE_LIMITED,
]);

interface PersonalTaxiState {
  activePartyId: string | null;
  pendingJoinRequestsByPartyId: Map<string, JoinRequestListItemResponseDto>;
  resolved: boolean;
}

const buildDefaultAvatar = (id: string): TaxiHomeAvatarViewData => ({
  backgroundColor: COLORS.border.default,
  iconColor: COLORS.text.muted,
  iconName: 'person-outline',
  id,
  kind: 'icon',
});

const buildLeaderAvatar = ({
  id,
  photoUrl,
}: {
  id: string;
  photoUrl?: string | null;
}): TaxiHomeAvatarViewData => {
  if (photoUrl) {
    return {
      id,
      kind: 'image',
      uri: photoUrl,
    };
  }

  return buildDefaultAvatar(id);
};

const mapHomeAvatarToPendingAvatar = (
  avatar: TaxiHomeAvatarViewData,
): TaxiAcceptancePendingAvatarViewData => ({...avatar});

const cloneAcceptancePendingAvatar = (
  avatar: TaxiAcceptancePendingAvatarViewData,
): TaxiAcceptancePendingAvatarViewData => {
  if (avatar.kind === 'image') {
    return {...avatar};
  }

  return {...avatar};
};

const cloneAcceptancePendingSeed = (
  seed: TaxiAcceptancePendingSeed,
): TaxiAcceptancePendingSeed => ({
  ...seed,
  leaderAvatar: cloneAcceptancePendingAvatar(seed.leaderAvatar),
  memberAvatars: seed.memberAvatars.map(cloneAcceptancePendingAvatar),
});

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
        label: '도착 완료',
        tone: 'inactive-danger' as const,
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
  const visibleParticipants = (party.participantSummaries ?? [])
    .filter(participant => !participant.isLeader && participant.id !== party.leaderId)
    .slice(0, 3);

  if (visibleParticipants.length > 0) {
    return visibleParticipants.map(buildParticipantAvatar);
  }

  const participantCount = Math.max(Math.min(party.currentMembers - 1, 3), 0);

  return Array.from({length: participantCount}, (_, index) =>
    buildDefaultAvatar(`${party.id}-member-${index + 1}`),
  );
};

const buildParticipantAvatar = (
  participant: PartyParticipantSummaryResponseDto,
): TaxiHomeAvatarViewData => {
  if (participant.photoUrl) {
    return {
      id: participant.id,
      kind: 'image',
      uri: participant.photoUrl,
    };
  }

  return buildDefaultAvatar(participant.id);
};

const normalizePartyTags = (tags?: string[] | null) =>
  tags?.map(tag => tag.trim()).filter(Boolean) ?? [];

const buildAcceptancePendingSeedFromPartyCard = (
  party: Pick<
    TaxiHomePartyCardViewData,
    | 'currentMemberCount'
    | 'departureAt'
    | 'departureLabel'
    | 'destinationLabel'
    | 'estimatedFareLabel'
    | 'id'
    | 'leaderAvatar'
    | 'leaderName'
    | 'maxMemberCount'
    | 'participantAvatars'
  >,
  requestId: string,
): TaxiAcceptancePendingSeed => ({
  currentMemberCount: party.currentMemberCount,
  departureAt: party.departureAt,
  departureLabel: party.departureLabel,
  destinationLabel: party.destinationLabel,
  estimatedFareLabel: party.estimatedFareLabel,
  leaderAvatar: mapHomeAvatarToPendingAvatar(party.leaderAvatar),
  leaderName: party.leaderName,
  maxMemberCount: party.maxMemberCount,
  memberAvatars: party.participantAvatars.map(mapHomeAvatarToPendingAvatar),
  partyId: party.id,
  requestId,
});

const canFallbackOnPersonalTaxiStateError = (error: unknown) =>
  error instanceof RepositoryError &&
  PERSONAL_STATE_FALLBACK_ERROR_CODES.has(error.code);

const hasApiErrorCode = (error: unknown, apiErrorCode: string) =>
  error instanceof RepositoryError &&
  error.context?.apiErrorCode === apiErrorCode;

const loadPersonalTaxiState = async (): Promise<PersonalTaxiState> => {
  const [myPartiesResponse, myJoinRequestsResponse] = await Promise.all([
    taxiHomeApiClient.getMyParties(),
    taxiHomeApiClient.getMyJoinRequests({
      status: 'PENDING',
    }),
  ]);

  const activeParty =
    myPartiesResponse.data.find(party =>
      ACTIVE_MY_PARTY_STATUSES.includes(party.status),
    ) ?? null;

  return {
    activePartyId: activeParty?.id ?? null,
    pendingJoinRequestsByPartyId: new Map(
      myJoinRequestsResponse.data.map(request => [request.partyId, request]),
    ),
    resolved: true,
  };
};

const buildJoinAction = ({
  party,
  activePartyId,
  pendingJoinRequest,
  personalStateResolved,
}: {
  party: TaxiHomePartyCardViewData;
  activePartyId: string | null;
  pendingJoinRequest?: JoinRequestListItemResponseDto;
  personalStateResolved: boolean;
}): TaxiHomePartyCardViewData['joinAction'] => {
  if (activePartyId === party.id) {
    return {
      helperText: '현재 내가 참여 중인 파티예요',
      label: '파티 채팅 가기',
      state: 'joined',
    };
  }

  if (pendingJoinRequest) {
    return {
      helperText: '파티장이 요청을 확인하고 있어요',
      label: '수락 대기 화면 보기',
      state: 'pending',
    };
  }

  if (!personalStateResolved) {
    return {
      helperText: '내 파티 상태를 확인하지 못해 지금은 요청할 수 없어요',
      label: '상태 확인 후 다시 시도',
      state: 'unavailable',
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
    helperText: '파티장에게 동승 요청을 보냅니다',
    label: '동승 요청하기',
    state: 'request',
  };
};

const buildBasePartyCard = (
  party: PartySummaryResponseDto,
  activePartyId: string | null,
): TaxiHomePartyCardViewData => {
  const statusMeta = buildStatusMeta(party.status);
  const departureTimeLabel = formatDepartureTimeLabel(party.departureTime);
  const leaderName = party.leaderName?.trim() || '파티장';
  const detail = party.detail?.trim() || undefined;
  const tags = normalizePartyTags(party.tags);
  const searchKeywords = [
    party.departure.name,
    party.destination.name,
    leaderName,
    departureTimeLabel,
    ...tags,
    detail,
  ].filter((keyword): keyword is string => Boolean(keyword));

  return {
    action: {
      type: activePartyId === party.id ? 'open-chat' : 'preview',
    },
    createdAt: party.createdAt,
    currentMemberCount: party.currentMembers,
    detail,
    departureAt: party.departureTime,
    departureLabel: party.departure.name,
    departureTimeLabel,
    destinationLabel: party.destination.name,
    estimatedFareLabel: '미정',
    filterIds: buildFilterIds(party.departure.name),
    id: party.id,
    leaderAvatar: buildLeaderAvatar({
      id: party.leaderId,
      photoUrl: party.leaderPhotoUrl,
    }),
    leaderName,
    leaderRoleLabel: '파티장',
    maxMemberCount: party.maxMembers,
    memberSummaryLabel: `${party.currentMembers}/${party.maxMembers}명`,
    participantAvatars: buildParticipantAvatars(party),
    searchKeywords,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    tags,
    joinAction: {
      label: '동승 요청하기',
      state: 'request',
    },
  };
};

const buildPartyCard = ({
  party,
  activePartyId,
  pendingJoinRequest,
  personalStateResolved,
}: {
  party: PartySummaryResponseDto;
  activePartyId: string | null;
  pendingJoinRequest?: JoinRequestListItemResponseDto;
  personalStateResolved: boolean;
}): TaxiHomePartyCardViewData => {
  const basePartyCard = buildBasePartyCard(party, activePartyId);

  return {
    ...basePartyCard,
    acceptancePendingSeed: pendingJoinRequest
      ? buildAcceptancePendingSeedFromPartyCard(
          basePartyCard,
          pendingJoinRequest.id,
        )
      : undefined,
    joinAction: buildJoinAction({
      party: basePartyCard,
      activePartyId,
      pendingJoinRequest,
      personalStateResolved,
    }),
  };
};

const buildTaxiHomeSourceData = ({
  parties,
  activePartyId,
  pendingJoinRequestsByPartyId,
  personalStateResolved,
}: {
  parties: PartySummaryResponseDto[];
  activePartyId: string | null;
  pendingJoinRequestsByPartyId: Map<string, JoinRequestListItemResponseDto>;
  personalStateResolved: boolean;
}): TaxiHomeSourceData => ({
  emptyState: {
    description: '검색어를 지우거나 다른 출발지 필터를 선택해보세요.',
    title: '조건에 맞는 파티가 없습니다',
  },
  filters: TAXI_HOME_FILTERS,
  liveChatActionLabel: '파티 채팅 가기',
  parties: parties.map(party =>
    buildPartyCard({
      party,
      activePartyId,
      pendingJoinRequest: pendingJoinRequestsByPartyId.get(party.id),
      personalStateResolved,
    }),
  ),
  primaryActionLabel: '새 파티 만들기',
  searchPlaceholder: '출발지 검색',
  sectionTitle: '택시 파티',
  sortOptions: TAXI_HOME_SORTS,
});

const mergePartySummaries = (
  ...partyGroups: PartySummaryResponseDto[][]
): PartySummaryResponseDto[] => {
  const partyById = new Map<string, PartySummaryResponseDto>();

  partyGroups.flat().forEach(party => {
    partyById.set(party.id, party);
  });

  return [...partyById.values()].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
};

export interface TaxiHomeQueryResult {
  activePartyId: string | null;
  hasActiveParty: boolean;
  source: TaxiHomeSourceData;
}

export async function createTaxiHomeJoinRequest(
  party: TaxiHomePartyCardViewData,
): Promise<TaxiAcceptancePendingSeed> {
  if (party.acceptancePendingSeed) {
    return cloneAcceptancePendingSeed(party.acceptancePendingSeed);
  }

  try {
    const response = await taxiHomeApiClient.createJoinRequest(party.id);

    return buildAcceptancePendingSeedFromPartyCard(
      party,
      response.data.id,
    );
  } catch (error) {
    if (hasApiErrorCode(error, 'ALREADY_REQUESTED')) {
      const pendingRequestsResponse = await taxiHomeApiClient.getMyJoinRequests({
        status: 'PENDING',
      });
      const existingRequest = pendingRequestsResponse.data.find(
        request => request.partyId === party.id,
      );

      if (existingRequest) {
        return buildAcceptancePendingSeedFromPartyCard(
          party,
          existingRequest.id,
        );
      }
    }

    throw error;
  }
}

export async function loadTaxiHomeQueryResult(): Promise<TaxiHomeQueryResult> {
  const [
    openPartiesResponse,
    closedPartiesResponse,
    arrivedPartiesResponse,
    personalTaxiState,
  ] =
    await Promise.all([
      taxiHomeApiClient.getOpenParties(),
      taxiHomeApiClient.getClosedParties(),
      taxiHomeApiClient.getArrivedParties(),
      loadPersonalTaxiState().catch(error => {
        if (!canFallbackOnPersonalTaxiStateError(error)) {
          throw error;
        }

        console.warn(
          '내 파티 상태 조회 실패, read-only fallback으로 계속합니다.',
          error,
        );
        return {
          activePartyId: null,
          pendingJoinRequestsByPartyId: new Map(),
          resolved: false,
        } as PersonalTaxiState;
      }),
    ]);
  const parties = mergePartySummaries(
    openPartiesResponse.data.content,
    closedPartiesResponse.data.content,
    arrivedPartiesResponse.data.content,
  );

  return {
    activePartyId: personalTaxiState.activePartyId,
    hasActiveParty: Boolean(personalTaxiState.activePartyId),
    source: buildTaxiHomeSourceData({
      activePartyId: personalTaxiState.activePartyId,
      parties,
      pendingJoinRequestsByPartyId:
        personalTaxiState.pendingJoinRequestsByPartyId,
      personalStateResolved: personalTaxiState.resolved,
    }),
  };
}
