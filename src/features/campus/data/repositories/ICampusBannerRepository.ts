import type {CampusBannerSourceData} from '../../model/campusHomeBanner';

export interface ICampusBannerRepository {
  getCampusBanners(): Promise<CampusBannerSourceData[]>;
}
