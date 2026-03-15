import type {ICommunityHomeRepository} from './ICommunityHomeRepository';
import {MockCommunityHomeRepository} from './MockCommunityHomeRepository';

export const communityHomeRepository: ICommunityHomeRepository =
  new MockCommunityHomeRepository();
