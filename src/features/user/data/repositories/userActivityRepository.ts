import {SpringUserActivityRepository} from './SpringUserActivityRepository';
import type {IUserActivityRepository} from './IUserActivityRepository';

export const userActivityRepository: IUserActivityRepository =
  new SpringUserActivityRepository();
