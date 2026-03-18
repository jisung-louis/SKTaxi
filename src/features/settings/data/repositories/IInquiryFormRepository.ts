import type {InquiryFormTypeKey} from '../../model/inquiryFormSource';

export interface SubmitInquiryFormPayload {
  content: string;
  title: string;
  type: InquiryFormTypeKey;
}

export interface IInquiryFormRepository {
  submitInquiryForm(payload: SubmitInquiryFormPayload): Promise<{id: string}>;
}
