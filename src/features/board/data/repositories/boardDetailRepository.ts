import type {IBoardDetailRepository} from './IBoardDetailRepository';
import {MockBoardDetailRepository} from './MockBoardDetailRepository';

export const boardDetailRepository: IBoardDetailRepository =
  new MockBoardDetailRepository();
