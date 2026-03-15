import type {IBoardDetailRepository} from './IBoardDetailRepository';
import type {BoardDetailSourceItem} from '../../model/boardDetailData';
import {BOARD_DETAIL_MOCK} from '../../mocks/boardDetail.mock';

const MOCK_DELAY_MS = 180;

const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export class MockBoardDetailRepository implements IBoardDetailRepository {
  async getBoardDetail(postId: string): Promise<BoardDetailSourceItem | null> {
    await delay(MOCK_DELAY_MS);

    return BOARD_DETAIL_MOCK.find(post => post.id === postId) ?? null;
  }
}
