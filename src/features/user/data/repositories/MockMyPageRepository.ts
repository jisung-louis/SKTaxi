import {myPageMockData} from '../../mocks/myPage.mock';
import type {MyPageSource} from '../../model/myPageSource';

import type {IMyPageRepository} from './IMyPageRepository';

const MOCK_DELAY_MS = 120;

export class MockMyPageRepository implements IMyPageRepository {
  async getMyPage(): Promise<MyPageSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    return myPageMockData;
  }
}
