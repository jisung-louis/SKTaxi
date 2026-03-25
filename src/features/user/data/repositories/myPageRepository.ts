import {SpringMyPageRepository} from './SpringMyPageRepository';
import {userActivityRepository} from './userActivityRepository';

export const myPageRepository = new SpringMyPageRepository(
  userActivityRepository,
);
