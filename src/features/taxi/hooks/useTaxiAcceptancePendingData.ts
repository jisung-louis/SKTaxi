import React from 'react';
import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {V2_COLORS} from '@/shared/design-system/tokens';

import {taxiAcceptancePendingRepository} from '../data/repositories/taxiAcceptancePendingRepository';
import type {
  TaxiAcceptancePendingAvatarViewData,
  TaxiAcceptancePendingNavigationParams,
  TaxiAcceptancePendingSeed,
  TaxiAcceptancePendingSourceData,
  TaxiAcceptancePendingViewData,
} from '../model/taxiAcceptancePendingViewData';

interface UseTaxiAcceptancePendingDataResult {
  cancelRequest: () => Promise<void>;
  data: TaxiAcceptancePendingViewData | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const FALLBACK_AVATAR_BACKGROUNDS = [
  '#E5E7EB',
  '#FDE68A',
  '#BFDBFE',
  '#D1FAE5',
] as const;

const cloneAvatar = (
  avatar: TaxiAcceptancePendingAvatarViewData,
): TaxiAcceptancePendingAvatarViewData => {
  if (avatar.kind === 'image') {
    return {...avatar};
  }

  return {...avatar};
};

const createLabelAvatar = (
  id: string,
  label: string,
  index = 0,
): TaxiAcceptancePendingAvatarViewData => ({
  backgroundColor:
    FALLBACK_AVATAR_BACKGROUNDS[
      index % FALLBACK_AVATAR_BACKGROUNDS.length
    ],
  id,
  kind: 'label',
  label: label.slice(0, 1) || '?',
  textColor: V2_COLORS.text.primary,
});

const buildSeedFromLegacyParams = (
  params: TaxiAcceptancePendingNavigationParams,
): TaxiAcceptancePendingSeed | null => {
  if (params.seed) {
    return {
      ...params.seed,
      leaderAvatar: cloneAvatar(params.seed.leaderAvatar),
      memberAvatars: params.seed.memberAvatars.map(cloneAvatar),
    };
  }

  if (!params.party || !params.requestId) {
    return null;
  }

  const {party, requestId} = params;
  const members = Array.isArray(party.members) ? party.members : [];
  const memberAvatars = members.slice(0, 2).map((memberId, index) =>
    createLabelAvatar(memberId, memberId, index + 1),
  );

  return {
    currentMemberCount: members.length,
    departureAt: party.departureTime,
    departureLabel: party.departure.name,
    destinationLabel: party.destination.name,
    estimatedFareLabel:
      party.settlement?.perPersonAmount && party.settlement.perPersonAmount > 0
        ? `${party.settlement.perPersonAmount.toLocaleString('ko-KR')}원`
        : '미정',
    leaderAvatar: createLabelAvatar(
      `${party.id ?? requestId}-leader`,
      party.leaderId,
    ),
    leaderName: party.leaderId,
    maxMemberCount: party.maxMembers,
    memberAvatars:
      memberAvatars.length > 0
        ? memberAvatars
        : [createLabelAvatar(`${party.id ?? requestId}-member`, '파', 1)],
    partyId: party.id ?? requestId,
    requestId,
  };
};

const formatDepartureAtLabel = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, 'M월 d일 a hh:mm', {locale: ko});
};

const buildViewData = (
  source: TaxiAcceptancePendingSourceData,
): TaxiAcceptancePendingViewData => ({
  cancelButtonLabel: source.cancelButtonLabel,
  cardTitle: source.cardTitle,
  heroDescription: source.statusDescription,
  heroTitle: source.statusTitle,
  partyId: source.partyId,
  requestId: source.requestId,
  requestState: source.requestState,
  route: {
    departureLabel: source.departureLabel,
    destinationLabel: source.destinationLabel,
  },
  rows: [
    {
      iconName: 'time-outline',
      id: 'departureAt',
      label: '출발 시간',
      type: 'text',
      value: formatDepartureAtLabel(source.departureAt),
    },
    {
      avatar: cloneAvatar(source.leaderAvatar),
      iconName: 'person-outline',
      id: 'leader',
      label: '파티장',
      type: 'leader',
      value: source.leaderName,
    },
    {
      avatars: source.memberAvatars.map(cloneAvatar),
      iconName: 'people-outline',
      id: 'members',
      label: '현재 인원',
      type: 'members',
      value: `${source.currentMemberCount}/${source.maxMemberCount}명`,
    },
  ],
});

export const useTaxiAcceptancePendingData = (
  params: TaxiAcceptancePendingNavigationParams,
): UseTaxiAcceptancePendingDataResult => {
  const seed = React.useMemo(
    () => buildSeedFromLegacyParams(params),
    [params],
  );
  const [source, setSource] =
    React.useState<TaxiAcceptancePendingSourceData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!seed) {
      setSource(null);
      setError('동승 요청 대기 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextSource =
        await taxiAcceptancePendingRepository.getPendingRequestSource(seed);
      setSource(nextSource);
    } catch (loadError) {
      console.error('동승 요청 대기 화면을 불러오지 못했습니다.', loadError);
      setError('동승 요청 대기 화면을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [seed]);

  React.useEffect(() => {
    load();
  }, [load]);

  const cancelRequest = React.useCallback(async () => {
    if (!seed?.requestId) {
      throw new Error('취소할 동승 요청이 없습니다.');
    }

    await taxiAcceptancePendingRepository.cancelRequest(seed.requestId);
  }, [seed?.requestId]);

  const data = React.useMemo(() => {
    if (!source) {
      return null;
    }

    return buildViewData(source);
  }, [source]);

  return {
    cancelRequest,
    data,
    error,
    loading,
    refetch: load,
  };
};
