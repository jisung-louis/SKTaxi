import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  AcademicScheduleDto,
  CafeteriaMenuDto,
} from '../dto/campusDto';

interface GetAcademicSchedulesParams {
  startDate?: string;
  endDate?: string;
  primary?: boolean;
}

export class CampusApiClient {
  getAcademicSchedules(params: GetAcademicSchedulesParams = {}) {
    return httpClient.get<ApiSuccessResponse<AcademicScheduleDto[]>>(
      '/v1/academic-schedules',
      {
        params,
      },
    );
  }

  getCurrentWeekCafeteriaMenu(date?: string) {
    return httpClient.get<ApiSuccessResponse<CafeteriaMenuDto>>(
      '/v1/cafeteria-menus',
      {
        params: date ? {date} : undefined,
      },
    );
  }

  getWeeklyCafeteriaMenu(weekId: string) {
    return httpClient.get<ApiSuccessResponse<CafeteriaMenuDto>>(
      `/v1/cafeteria-menus/${weekId}`,
    );
  }
}

export const campusApiClient = new CampusApiClient();
