import type {ITaxiRecruitRepository} from './ITaxiRecruitRepository';
import {MockTaxiRecruitRepository} from './MockTaxiRecruitRepository';

export const taxiRecruitRepository: ITaxiRecruitRepository =
  new MockTaxiRecruitRepository();
