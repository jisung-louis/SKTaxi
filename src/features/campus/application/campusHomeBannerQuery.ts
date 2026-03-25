import type {CampusBannerViewData} from '../model/campusHomeBanner';
import {CAMPUS_HOME_BANNER_MOCK_SOURCE} from '../model/campusHomeBanner.mock';
import {mapCampusBannerSourceToViewData} from './campusHomeBannerMapper';

export const loadCampusHomeBannerViewData = (): CampusBannerViewData[] =>
  CAMPUS_HOME_BANNER_MOCK_SOURCE.map(mapCampusBannerSourceToViewData);
