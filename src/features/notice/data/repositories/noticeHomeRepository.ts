import type {INoticeHomeRepository} from './INoticeHomeRepository';
import {MockNoticeHomeRepository} from './MockNoticeHomeRepository';

export const noticeHomeRepository: INoticeHomeRepository =
  new MockNoticeHomeRepository();
