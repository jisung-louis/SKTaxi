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
