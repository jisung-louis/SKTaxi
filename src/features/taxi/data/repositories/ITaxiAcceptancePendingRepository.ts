import type {
  TaxiAcceptancePendingSeed,
  TaxiAcceptancePendingSourceData,
} from '../../model/taxiAcceptancePendingViewData';

export interface ITaxiAcceptancePendingRepository {
  cancelRequest(requestId: string): Promise<void>;
  getPendingRequestSource(
    seed: TaxiAcceptancePendingSeed,
  ): Promise<TaxiAcceptancePendingSourceData>;
}
