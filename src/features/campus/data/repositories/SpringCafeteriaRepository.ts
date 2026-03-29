import {RepositoryError, RepositoryErrorCode} from '@/shared/lib/errors';

import {campusApiClient, CampusApiClient} from '../api/campusApiClient';
import {
  mapCafeteriaMenuDto,
  mapCafeteriaMenuReactionResponseDto,
} from '../mappers/campusMapper';
import type {
  CafeteriaMenuReactionSummary,
  CafeteriaMenuReactionType,
  WeeklyMenu,
} from '../../model/cafeteria';
import type {ICafeteriaRepository} from './ICafeteriaRepository';

export class SpringCafeteriaRepository implements ICafeteriaRepository {
  constructor(private readonly apiClient: CampusApiClient = campusApiClient) {}

  async getCurrentWeekMenu(): Promise<WeeklyMenu | null> {
    try {
      const response = await this.apiClient.getCurrentWeekCafeteriaMenu();
      return mapCafeteriaMenuDto(response.data);
    } catch (error) {
      if (
        error instanceof RepositoryError &&
        error.code === RepositoryErrorCode.NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
  }

  async getWeeklyMenu(weekId: string): Promise<WeeklyMenu | null> {
    try {
      const response = await this.apiClient.getWeeklyCafeteriaMenu(weekId);
      return mapCafeteriaMenuDto(response.data);
    } catch (error) {
      if (
        error instanceof RepositoryError &&
        error.code === RepositoryErrorCode.NOT_FOUND
      ) {
        return null;
      }

      throw error;
    }
  }

  async upsertMenuReaction(
    menuId: string,
    reaction: CafeteriaMenuReactionType | null,
  ): Promise<CafeteriaMenuReactionSummary> {
    const response = await this.apiClient.upsertCafeteriaMenuReaction(
      menuId,
      reaction,
    );

    return mapCafeteriaMenuReactionResponseDto(response.data);
  }
}
