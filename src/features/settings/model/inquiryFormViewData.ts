import type {InquiryFormTypeKey} from './inquiryFormSource';

export interface InquiryTypeOptionViewData {
  id: InquiryFormTypeKey;
  isSelected: boolean;
  label: string;
}

export interface InquiryFormAttachmentViewData {
  id: string;
  label: string;
  uri: string;
}

export interface InquiryFormScreenViewData {
  attachmentCountLabel: string;
  attachmentHelperLines: [string, string];
  attachmentTitle: string;
  attachments: InquiryFormAttachmentViewData[];
  contentCountLabel: string;
  contentMaxLength: number;
  contentPlaceholder: string;
  guideLines: [string, string];
  selectedTypeId: InquiryFormTypeKey | null;
  submitLabel: string;
  titleCountLabel: string;
  titleMaxLength: number;
  titlePlaceholder: string;
  typeOptions: InquiryTypeOptionViewData[];
}
