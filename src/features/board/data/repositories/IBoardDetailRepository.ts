import type {BoardDetailSourceItem} from '../../model/boardDetailData';

export interface IBoardDetailRepository {
  getBoardDetail(postId: string): Promise<BoardDetailSourceItem | null>;
}
