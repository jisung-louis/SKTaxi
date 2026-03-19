import {RepositoryError, RepositoryErrorCode} from '@/shared/lib/errors';

import {taxiHomeApiClient} from '../data/api/taxiHomeApiClient';
import type {
  JoinRequestListItemResponseDto,
  PartyDetailResponseDto,
} from '../data/dto/taxiHomeDto';
import type {
  TaxiAcceptancePendingAvatarViewData,
  TaxiAcceptancePendingRequestState,
  TaxiAcceptancePendingSeed,
  TaxiAcceptancePendingSourceData,
} from '../model/taxiAcceptancePendingViewData';

const AVATAR_PALETTE = [
  {backgroundColor: '#E5E7EB', textColor: '#111827'},
  {backgroundColor: '#FDE68A', textColor: '#111827'},
  {backgroundColor: '#BFDBFE', textColor: '#1E3A8A'},
  {backgroundColor: '#D1FAE5', textColor: '#065F46'},
] as const;

const hashSeed = (value: string) =>
  Array.from(value).reduce(
    (seed, character) => seed + character.charCodeAt(0),
    0,
  );

const buildLabelAvatar = (
  id: string,
  label: string,
): TaxiAcceptancePendingAvatarViewData => {
  const palette = AVATAR_PALETTE[hashSeed(id) % AVATAR_PALETTE.length];

  return {
    backgroundColor: palette.backgroundColor,
    id,
    kind: 'label',
    label: label.slice(0, 1) || '?',
    textColor: palette.textColor,
  };
};

const buildMemberAvatar = ({
  id,
  label,
  photoUrl,
}: {
  id: string;
  label: string;
  photoUrl?: string | null;
}): TaxiAcceptancePendingAvatarViewData => {
  if (photoUrl) {
    return {
      id,
      kind: 'image',
      uri: photoUrl,
    };
  }

  return buildLabelAvatar(id, label);
};

const mapRequestState = (
  status: JoinRequestListItemResponseDto['status'],
): TaxiAcceptancePendingRequestState => {
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

const buildPendingStatusCopy = (
  requestState: TaxiAcceptancePendingRequestState,
) => {
  switch (requestState) {
    case 'accepted':
      return {
        cancelButtonLabel: '파티 채팅으로 이동',
        statusDescription: '파티 채팅으로 이동하고 있습니다.',
        statusTitle: '동승 요청이 수락되었어요',
      };
    case 'declined':
      return {
        cancelButtonLabel: '확인',
        statusDescription: '다른 파티를 찾아 다시 요청할 수 있어요.',
        statusTitle: '동승 요청이 거절되었어요',
      };
    case 'canceled':
      return {
        cancelButtonLabel: '확인',
        statusDescription: '요청이 취소되어 더 이상 대기하지 않습니다.',
        statusTitle: '동승 요청이 취소되었어요',
      };
    case 'pending':
    default:
      return {
        cancelButtonLabel: '동승 요청 취소하기',
        statusDescription: '파티장이 요청을 확인하고 있어요',
        statusTitle: '수락 대기중',
      };
  }
};

const canFallbackToSeed = (error: unknown) =>
  error instanceof RepositoryError &&
  (error.code === RepositoryErrorCode.NOT_FOUND ||
    error.code === RepositoryErrorCode.PERMISSION_DENIED);

const buildSourceFromSeed = ({
  requestState,
  seed,
}: {
  requestState: TaxiAcceptancePendingRequestState;
  seed: TaxiAcceptancePendingSeed;
}): TaxiAcceptancePendingSourceData => {
  const statusCopy = buildPendingStatusCopy(requestState);

  return {
    ...seed,
    cancelButtonLabel: statusCopy.cancelButtonLabel,
    cardTitle: '동승 요청한 파티 정보',
    requestState,
    statusDescription: statusCopy.statusDescription,
    statusTitle: statusCopy.statusTitle,
  };
};

const buildSourceFromParty = ({
  party,
  requestState,
  seed,
}: {
  party: PartyDetailResponseDto;
  requestState: TaxiAcceptancePendingRequestState;
  seed: TaxiAcceptancePendingSeed;
}): TaxiAcceptancePendingSourceData => {
  const statusCopy = buildPendingStatusCopy(requestState);
  const leaderMember =
    party.members.find(member => member.isLeader) ??
    party.members.find(member => member.id === party.leaderId) ??
    null;
  const memberAvatars = party.members
    .filter(member => !member.isLeader)
    .map(member =>
      buildMemberAvatar({
        id: member.id,
        label: member.nickname?.trim() || member.id,
        photoUrl: member.photoUrl,
      }),
    );

  return {
    ...seed,
    cancelButtonLabel: statusCopy.cancelButtonLabel,
    cardTitle: '동승 요청한 파티 정보',
    currentMemberCount: party.members.length,
    departureAt: party.departureTime,
    departureLabel: party.departure.name,
    destinationLabel: party.destination.name,
    estimatedFareLabel:
      party.settlement?.perPersonAmount && party.settlement.perPersonAmount > 0
        ? `${party.settlement.perPersonAmount.toLocaleString('ko-KR')}원`
        : seed.estimatedFareLabel,
    leaderAvatar: buildMemberAvatar({
      id: leaderMember?.id ?? `${party.id}-leader`,
      label:
        leaderMember?.nickname?.trim() ||
        party.leaderName?.trim() ||
        seed.leaderName,
      photoUrl: leaderMember?.photoUrl ?? party.leaderPhotoUrl,
    }),
    leaderName:
      leaderMember?.nickname?.trim() ||
      party.leaderName?.trim() ||
      seed.leaderName,
    maxMemberCount: party.maxMembers,
    memberAvatars:
      memberAvatars.length > 0 ? memberAvatars : seed.memberAvatars,
    requestState,
    statusDescription: statusCopy.statusDescription,
    statusTitle: statusCopy.statusTitle,
  };
};

export async function cancelTaxiJoinRequest(requestId: string): Promise<void> {
  await taxiHomeApiClient.cancelJoinRequest(requestId);
}

export async function loadTaxiAcceptancePendingSource(
  seed: TaxiAcceptancePendingSeed,
): Promise<TaxiAcceptancePendingSourceData> {
  const joinRequestsResponse = await taxiHomeApiClient.getMyJoinRequests();
  const targetRequest = joinRequestsResponse.data.find(
    request => request.id === seed.requestId,
  );

  if (!targetRequest) {
    throw new Error('동승 요청을 찾을 수 없습니다.');
  }

  const requestState = mapRequestState(targetRequest.status);

  try {
    const partyResponse = await taxiHomeApiClient.getParty(seed.partyId);

    return buildSourceFromParty({
      party: partyResponse.data,
      requestState,
      seed,
    });
  } catch (error) {
    if (!canFallbackToSeed(error)) {
      throw error;
    }

    return buildSourceFromSeed({
      requestState,
      seed,
    });
  }
}
