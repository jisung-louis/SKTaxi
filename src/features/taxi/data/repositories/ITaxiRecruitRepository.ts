import type {
  TaxiRecruitDraft,
  TaxiRecruitSubmitResult,
} from '../../model/taxiRecruitData';

export interface ITaxiRecruitRepository {
  submitRecruit(draft: TaxiRecruitDraft): Promise<TaxiRecruitSubmitResult>;
}
