import type {InquiryFormTypeKey} from '../../model/inquiryFormSource';

export interface SubmitInquiryFormAttachmentPayload {
  fileName?: string;
  mimeType?: string;
  uri: string;
}

export interface SubmitInquiryFormPayload {
  attachments?: SubmitInquiryFormAttachmentPayload[] | null;
  content: string;
  title: string;
  type: InquiryFormTypeKey;
}

export interface IInquiryFormRepository {
  submitInquiryForm(payload: SubmitInquiryFormPayload): Promise<{id: string}>;
}
