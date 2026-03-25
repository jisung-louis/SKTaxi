import type {IMemberDirectoryRepository} from './IMemberDirectoryRepository';
import {SpringMemberDirectoryRepository} from './SpringMemberDirectoryRepository';

export const memberDirectoryRepository: IMemberDirectoryRepository =
  new SpringMemberDirectoryRepository();
