import {MockAccountManagementRepository} from './MockAccountManagementRepository';

import type {IAccountManagementRepository} from './IAccountManagementRepository';

export const accountManagementRepository: IAccountManagementRepository =
  new MockAccountManagementRepository();
