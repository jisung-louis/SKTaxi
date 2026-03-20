import type {TaxiAcceptancePendingNavigationParams} from './taxiAcceptancePendingViewData';
import type {TaxiRecruitLocationKind, TaxiRecruitLocationSelection} from './taxiRecruitData';
import type {PartyLocation} from './types';

export type TaxiStackParamList = {
  TaxiMain: undefined;
  AcceptancePending: TaxiAcceptancePendingNavigationParams;
  Recruit:
    | {
        selection?: TaxiRecruitLocationSelection;
        selectionToken?: string;
      }
    | undefined;
  TaxiLocationPicker: {
    initialLocation?: PartyLocation;
    initialName: string;
    kind: TaxiRecruitLocationKind;
  };
  Chat: { partyId: string };
};
