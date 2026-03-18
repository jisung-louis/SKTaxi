import type {TaxiAcceptancePendingNavigationParams} from './taxiAcceptancePendingViewData';

export type TaxiStackParamList = {
  TaxiMain: undefined;
  AcceptancePending: TaxiAcceptancePendingNavigationParams;
  Recruit: undefined;
  Chat: { partyId: string };
};
