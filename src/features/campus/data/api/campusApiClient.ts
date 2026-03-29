import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  AcademicScheduleDto,
  CampusBannerResponseDto,
  CafeteriaMenuReactionResponseDto,
  CafeteriaMenuReactionTypeDto,
  CafeteriaMenuDto,
  UpsertCafeteriaMenuReactionRequestDto,
} from '../dto/campusDto';

interface GetAcademicSchedulesParams {
  startDate?: string;
  endDate?: string;
  primary?: boolean;
}

export class CampusApiClient {
  getCampusBanners() {
    return httpClient.get<ApiSuccessResponse<CampusBannerResponseDto[]>>(
      '/v1/campus-banners',
      {
        requiresAuth: false,
      },
    );
  }

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

  upsertCafeteriaMenuReaction(
    menuId: string,
    reaction: CafeteriaMenuReactionTypeDto | null,
  ) {
    return httpClient.put<
      ApiSuccessResponse<CafeteriaMenuReactionResponseDto>,
      UpsertCafeteriaMenuReactionRequestDto
    >(`/v1/cafeteria-menu-reactions/${menuId}`, {
      reaction,
    });
  }
}

export const campusApiClient = new CampusApiClient();
