export type InquiryFormTypeKey =
  | 'feature'
  | 'bug'
  | 'account'
  | 'service'
  | 'other';

export interface InquiryTypeOptionSource {
  id: InquiryFormTypeKey;
  label: string;
}

export interface InquiryFormSource {
  attachmentHelperLines: [string, string];
  attachmentTitle: string;
  contentMaxLength: number;
  contentPlaceholder: string;
  guideLines: [string, string];
  submitLabel: string;
  titleMaxLength: number;
  titlePlaceholder: string;
  typeOptions: InquiryTypeOptionSource[];
}
