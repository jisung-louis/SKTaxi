import {inquiryFormMockData} from '../../mocks/inquiryForm.mock';
import type {InquiryFormSource} from '../../model/inquiryFormSource';

import type {
  IInquiryFormRepository,
  SubmitInquiryFormPayload,
} from './IInquiryFormRepository';

const MOCK_DELAY_MS = 120;

const submittedInquiries: Array<SubmitInquiryFormPayload & {id: string}> = [];

export class MockInquiryFormRepository implements IInquiryFormRepository {
  async getInquiryForm(): Promise<InquiryFormSource> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    return inquiryFormMockData;
  }

  async submitInquiryForm(
    payload: SubmitInquiryFormPayload,
  ): Promise<{id: string}> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

    const id = `mock-inquiry-${submittedInquiries.length + 1}`;
    submittedInquiries.push({...payload, id});
    return {id};
  }
}
