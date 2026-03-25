import type {IAccountManagementRepository} from './IAccountManagementRepository';
import {SpringAccountManagementRepository} from './SpringAccountManagementRepository';

export const accountManagementRepository: IAccountManagementRepository =
  new SpringAccountManagementRepository();
