import type { CampusHomeViewData } from '../../model/campusHome';

export interface ICampusHomeRepository {
  getCampusHomeViewData(): Promise<CampusHomeViewData>;
}
