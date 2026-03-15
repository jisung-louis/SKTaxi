import type {TaxiHomeSourceData} from '../../model/taxiHomeViewData';

export interface ITaxiHomeRepository {
  getHomeData(): Promise<TaxiHomeSourceData>;
}
