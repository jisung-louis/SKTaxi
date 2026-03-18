import type {IAppNoticeScreenRepository} from './IAppNoticeScreenRepository';
import {MockAppNoticeScreenRepository} from './MockAppNoticeScreenRepository';

export const appNoticeScreenRepository: IAppNoticeScreenRepository =
  new MockAppNoticeScreenRepository();
