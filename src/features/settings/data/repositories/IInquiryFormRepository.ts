import type {InquiryFormSource, InquiryFormTypeKey} from '../../model/inquiryFormSource';

export interface SubmitInquiryFormPayload {
  content: string;
  title: string;
  type: InquiryFormTypeKey;
}

export interface IInquiryFormRepository {
  getInquiryForm(): Promise<InquiryFormSource>;
  submitInquiryForm(payload: SubmitInquiryFormPayload): Promise<{id: string}>;
}
