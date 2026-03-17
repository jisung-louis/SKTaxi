import type {InquiryFormTypeKey} from './inquiryFormSource';

export interface InquiryTypeOptionViewData {
  id: InquiryFormTypeKey;
  isSelected: boolean;
  label: string;
}

export interface InquiryFormScreenViewData {
  attachmentHelperLines: [string, string];
  attachmentTitle: string;
  contentCountLabel: string;
  contentPlaceholder: string;
  guideLines: [string, string];
  selectedTypeId: InquiryFormTypeKey | null;
  submitLabel: string;
  titleCountLabel: string;
  titlePlaceholder: string;
  typeOptions: InquiryTypeOptionViewData[];
}
