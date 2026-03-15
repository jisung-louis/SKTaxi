import type {IChatDetailRepository} from './IChatDetailRepository';
import {MockChatDetailRepository} from './MockChatDetailRepository';

export const chatDetailRepository: IChatDetailRepository =
  new MockChatDetailRepository();
