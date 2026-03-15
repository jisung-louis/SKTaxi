import type { Party } from './types';

export type TaxiStackParamList = {
  TaxiMain: undefined;
  AcceptancePending: { party: Party; requestId: string };
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
