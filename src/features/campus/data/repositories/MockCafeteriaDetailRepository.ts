import {cafeteriaDetailMockData} from '../../mocks/cafeteriaDetail.mock';
import type {CafeteriaDetailSource} from '../../model/cafeteriaDetailSource';

import type {ICafeteriaDetailRepository} from './ICafeteriaDetailRepository';

const MOCK_DELAY_MS = 120;

export class MockCafeteriaDetailRepository
  implements ICafeteriaDetailRepository
{
  async getMenu(): Promise<CafeteriaDetailSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    return cafeteriaDetailMockData;
  }
}
