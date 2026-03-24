import {campusApiClient, CampusApiClient} from '../api/campusApiClient';
import {mapAcademicScheduleDto} from '../mappers/campusMapper';
import type {AcademicSchedule} from '../../model/academic';
import type {IAcademicRepository} from './IAcademicRepository';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export class SpringAcademicRepository implements IAcademicRepository {
  constructor(private readonly apiClient: CampusApiClient = campusApiClient) {}

  async getSchedules(): Promise<AcademicSchedule[]> {
    const response = await this.apiClient.getAcademicSchedules();
    return response.data.map(mapAcademicScheduleDto);
  }

  async getSchedulesByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<AcademicSchedule[]> {
    const response = await this.apiClient.getAcademicSchedules({
      endDate: formatDate(endDate),
      startDate: formatDate(startDate),
    });
    return response.data.map(mapAcademicScheduleDto);
  }
}
