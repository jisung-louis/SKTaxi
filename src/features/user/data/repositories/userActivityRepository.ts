import {MockUserActivityRepository} from './MockUserActivityRepository';
import type {IUserActivityRepository} from './IUserActivityRepository';

export const userActivityRepository: IUserActivityRepository =
  new MockUserActivityRepository();
