import type {ICampusBannerRepository} from '../data/repositories/ICampusBannerRepository';
import type {CampusBannerViewData} from '../model/campusHomeBanner';
import {CAMPUS_HOME_BANNER_MOCK_SOURCE} from '../model/campusHomeBanner.mock';
import {mapCampusBannerSourceToViewData} from './campusHomeBannerMapper';

export const getDefaultCampusHomeBannerViewData = (): CampusBannerViewData[] =>
  CAMPUS_HOME_BANNER_MOCK_SOURCE.map(mapCampusBannerSourceToViewData);

export const loadCampusHomeBannerViewData = async ({
  campusBannerRepository,
}: {
  campusBannerRepository: ICampusBannerRepository;
}): Promise<CampusBannerViewData[]> => {
  const items = await campusBannerRepository.getCampusBanners();

  if (items.length === 0) {
    return getDefaultCampusHomeBannerViewData();
  }

  return items.map(mapCampusBannerSourceToViewData);
};
