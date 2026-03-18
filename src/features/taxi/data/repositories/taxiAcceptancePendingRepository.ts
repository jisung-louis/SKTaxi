import type {ITaxiAcceptancePendingRepository} from './ITaxiAcceptancePendingRepository';
import {MockTaxiAcceptancePendingRepository} from './MockTaxiAcceptancePendingRepository';

export const taxiAcceptancePendingRepository: ITaxiAcceptancePendingRepository =
  new MockTaxiAcceptancePendingRepository();
