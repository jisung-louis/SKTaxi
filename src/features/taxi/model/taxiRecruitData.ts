export type TaxiRecruitLocationMode = 'preset' | 'custom';

export interface TaxiRecruitLocationValue {
  label: string;
  mode: TaxiRecruitLocationMode;
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
