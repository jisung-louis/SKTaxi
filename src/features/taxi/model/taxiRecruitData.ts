import type {PartyLocation} from './types';

export type TaxiRecruitLocationKind = 'departure' | 'destination';
export type TaxiRecruitLocationMode = 'preset' | 'custom';

export interface TaxiRecruitLocationValue extends PartyLocation {
  mode: TaxiRecruitLocationMode;
}

export interface TaxiRecruitLocationSelection {
  kind: TaxiRecruitLocationKind;
  location: PartyLocation;
}

export interface TaxiRecruitDraft {
  departure: TaxiRecruitLocationValue;
  destination: TaxiRecruitLocationValue;
  departureAtISO: string;
  departureDayOffset: 0 | 1;
  detail: string;
  maxMembers: number;
  tags: string[];
}

export interface TaxiRecruitSubmitResult {
  message: string;
  partyId?: string;
  status: 'blocked' | 'mocked' | 'spring';
}
