import type {ITaxiHomeRepository} from './ITaxiHomeRepository';
import {MockTaxiHomeRepository} from './MockTaxiHomeRepository';

export const taxiHomeRepository: ITaxiHomeRepository =
  new MockTaxiHomeRepository();
