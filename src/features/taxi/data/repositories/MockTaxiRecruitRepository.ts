import type {ITaxiRecruitRepository} from './ITaxiRecruitRepository';
import {taxiChatRepository} from './taxiChatRepository';

import type {
  TaxiRecruitDraft,
  TaxiRecruitSubmitResult,
} from '../../model/taxiRecruitData';

const MOCK_DELAY_MS = 450;

export class MockTaxiRecruitRepository implements ITaxiRecruitRepository {
  async submitRecruit(
    draft: TaxiRecruitDraft,
  ): Promise<TaxiRecruitSubmitResult> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    const {partyId} = await taxiChatRepository.createPartyChat(draft);

    return {
      message: '파티 채팅방으로 바로 이동합니다.',
      partyId,
      status: 'mocked',
    };
  }
}
