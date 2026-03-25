import type {
  IInquiryFormRepository,
  SubmitInquiryFormPayload,
} from './IInquiryFormRepository';

const MOCK_DELAY_MS = 120;

const submittedInquiries: Array<SubmitInquiryFormPayload & {id: string}> = [];

export class MockInquiryFormRepository implements IInquiryFormRepository {
  async submitInquiryForm(
    payload: SubmitInquiryFormPayload,
  ): Promise<{id: string}> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

    const id = `mock-inquiry-${submittedInquiries.length + 1}`;
    submittedInquiries.push({...payload, id});
    return {id};
  }
}
