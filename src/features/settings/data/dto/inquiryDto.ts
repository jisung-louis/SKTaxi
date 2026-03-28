export type InquiryTypeDto =
  | 'ACCOUNT'
  | 'BUG'
  | 'FEATURE'
  | 'OTHER'
  | 'SERVICE';

export interface InquiryAttachmentDto {
  height: number;
  mime: string;
  size: number;
  thumbUrl: string;
  url: string;
  width: number;
}

export interface CreateInquiryRequestDto {
  attachments?: InquiryAttachmentDto[] | null;
  content: string;
  subject: string;
  type: InquiryTypeDto;
}

export interface InquiryCreateResponseDto {
  createdAt: string;
  id: string;
  status: string;
}
