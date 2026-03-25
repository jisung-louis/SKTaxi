import type {MyPageSource} from '../../model/myPageSource';

export interface IMyPageRepository {
  getMyPage(): Promise<MyPageSource>;
}
