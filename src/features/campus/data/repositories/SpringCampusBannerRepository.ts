import {CampusApiClient, campusApiClient} from '../api/campusApiClient';
import {mapCampusBannerDto} from '../mappers/campusMapper';
import type {ICampusBannerRepository} from './ICampusBannerRepository';

export class SpringCampusBannerRepository implements ICampusBannerRepository {
  constructor(private readonly apiClient: CampusApiClient = campusApiClient) {}

  async getCampusBanners() {
    const response = await this.apiClient.getCampusBanners();

    return response.data.map(mapCampusBannerDto);
  }
}
