import type {Party} from './types';

export type TaxiAcceptancePendingRequestState =
  | 'pending'
  | 'accepted'
  | 'declined';

export type TaxiAcceptancePendingAvatarViewData =
  | {
      id: string;
      kind: 'label';
      label: string;
      backgroundColor: string;
      textColor: string;
    }
  | {
      id: string;
      kind: 'image';
      uri: string;
    };

export interface TaxiAcceptancePendingSeed {
  currentMemberCount: number;
  departureAt: string;
  departureLabel: string;
  destinationLabel: string;
  estimatedFareLabel: string;
  leaderAvatar: TaxiAcceptancePendingAvatarViewData;
  leaderName: string;
  maxMemberCount: number;
  memberAvatars: TaxiAcceptancePendingAvatarViewData[];
  partyId: string;
  requestId: string;
}

export interface TaxiAcceptancePendingSourceData
  extends TaxiAcceptancePendingSeed {
  cancelButtonLabel: string;
  cancelHintLabel: string;
  cardTitle: string;
  requestState: TaxiAcceptancePendingRequestState;
  statusDescription: string;
  statusTitle: string;
}

export type TaxiAcceptancePendingInfoRowViewData =
  | {
      id: 'departureAt';
      type: 'text';
      iconName: string;
      label: string;
      tone?: 'default' | 'accent';
      value: string;
    }
  | {
      id: 'leader';
      type: 'leader';
      iconName: string;
      label: string;
      value: string;
      avatar: TaxiAcceptancePendingAvatarViewData;
    }
  | {
      id: 'members';
      type: 'members';
      iconName: string;
      label: string;
      value: string;
      avatars: TaxiAcceptancePendingAvatarViewData[];
    }
  | {
      id: 'fare';
      type: 'text';
      label: string;
      tone: 'accent';
      value: string;
    };

export interface TaxiAcceptancePendingViewData {
  cancelButtonLabel: string;
  cancelHintLabel: string;
  cardTitle: string;
  heroDescription: string;
  heroTitle: string;
  partyId: string;
  requestId: string;
  requestState: TaxiAcceptancePendingRequestState;
  route: {
    departureLabel: string;
    destinationLabel: string;
  };
  rows: TaxiAcceptancePendingInfoRowViewData[];
}

export interface TaxiAcceptancePendingNavigationParams {
  party?: Party;
  requestId?: string;
  seed?: TaxiAcceptancePendingSeed;
}
