import type {INoticeDetailRepository} from './INoticeDetailRepository';
import {MockNoticeDetailRepository} from './MockNoticeDetailRepository';

export const noticeDetailRepository: INoticeDetailRepository =
  new MockNoticeDetailRepository();
