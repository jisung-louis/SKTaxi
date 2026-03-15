import type {ITaxiChatRepository} from './ITaxiChatRepository';
import {MockTaxiChatRepository} from './MockTaxiChatRepository';

export const taxiChatRepository: ITaxiChatRepository =
  new MockTaxiChatRepository();
