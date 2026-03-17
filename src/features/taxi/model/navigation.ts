import type {TaxiAcceptancePendingNavigationParams} from './taxiAcceptancePendingViewData';

export type TaxiStackParamList = {
  TaxiMain: undefined;
  AcceptancePending: TaxiAcceptancePendingNavigationParams;
  Recruit: undefined;
  MapSearch: {
    type: 'departure' | 'destination';
    onLocationSelect: (location: {
      latitude: number;
      longitude: number;
      address: string;
    }) => void;
  };
  Chat: { partyId: string };
};
