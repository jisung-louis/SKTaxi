import type {CafeteriaDetailSource} from '../../model/cafeteriaDetailSource';

export interface ICafeteriaDetailRepository {
  getMenu(): Promise<CafeteriaDetailSource>;
}
