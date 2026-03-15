import type {ITaxiRecruitRepository} from './ITaxiRecruitRepository';

import type {
  TaxiRecruitDraft,
  TaxiRecruitSubmitResult,
} from '../../model/taxiRecruitData';

const MOCK_DELAY_MS = 450;

export class MockTaxiRecruitRepository implements ITaxiRecruitRepository {
  async submitRecruit(
    _draft: TaxiRecruitDraft,
  ): Promise<TaxiRecruitSubmitResult> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

    return {
      message:
        '임시 모집 생성 화면입니다. 추후 Spring REST API와 연결할 예정입니다.',
      status: 'mocked',
    };
  }
}
